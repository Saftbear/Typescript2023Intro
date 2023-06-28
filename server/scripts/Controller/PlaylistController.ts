import { Request, Response, RequestHandler } from "express"
import { AppDataSource } from "../../database/data-source";
import { Playlist, User } from "../../database";
import { VideoResponse } from "../types/Response";
import { CreatePlaylistRequestBody } from "../types/Requests";


export const getPlaylists: RequestHandler = async (req: Request, res: Response) => {
  try {
    const playlists = await AppDataSource.manager.find(Playlist, {
      relations: ["videos", "user"]
    });

    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).send(error);
  }
};

export const getVideosInPlaylist: RequestHandler<{ playlistid: string }> = async (req: Request, res: Response) => {
  try {
    const playlistId: number = Number(req.headers.playlistid);

    if(Number.isNaN(playlistId)){
      return res.status(400).json({ message: "Invalid Playlist ID" });
    }
    
    const playlist = await AppDataSource.manager.findOne(Playlist, { where: { id: playlistId }, relations: ["videos", "videos.user"] });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const videos = playlist.videos;

    const response: VideoResponse[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      path: video.path,
      user: video.user.username,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).send(error);
  }
};

export const createPlaylists: RequestHandler = async (req: Request<{}, {}, CreatePlaylistRequestBody>, res: Response) => {
  try {
    const { playlistName } = req.body;
    
    if(!playlistName){
      return res.status(400).json({ message: "Invalid playlistName" });
    }

    const userId = Number(req.headers.userid);
    if(Number.isNaN(userId)){
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const playlist = new Playlist();
    playlist.name = playlistName;
    playlist.user = user;
    playlist.videos = [];

    await AppDataSource.manager.save(playlist);

    res.status(200).json({ success: true, message: 'Playlist successfully created!' });
  } catch (error) {
    const err = error as any;
    if (err.code === 'SQLITE_CONSTRAINT') {
        let failedConstraint = err.message.split('playlist.')[1];
        if (failedConstraint == "name")
        {
          return res.status(400).json({ message: "Playlist with that name already exists", success: false });
        }
        else{
          return res.status(500).json({ message: "Error registering user", success: false });
        }
    }
  }
};
