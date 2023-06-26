import { Request, Response } from "express"
import { AppDataSource } from "../../database/data-source";
import { Playlist, User, Video } from "../../database";
import { VideoResponse } from "../types/Response";
export const getPlaylists = async (req: Request, res: Response) => {
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
export const getVideosInPlaylist = async (req: Request, res: Response) => {
  try {
    const playlistId = Number(req.headers.playlistid);  // Adjusted from req.headers to req.params assuming the playlist id is a URL parameter

    // Fetch the Playlist and its associated videos
    const playlist = await AppDataSource.manager.findOne(Playlist, { where: { id: playlistId }, relations: ["videos", "videos.user"] });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const videos = playlist.videos;

    // Fetch the User associated with each Video

    const response: VideoResponse[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      path: video.path,
      user: video.user.username,
    }));
    console.log(response)
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).send(error);
  }
};



export const createPlaylists = async (req: Request, res: Response) => {

  try {
    const { playlistName } = req.body;
    const userId = Number(req.headers.userid);
  
  

    // Fetch the user
    const user = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new Playlist instance
    const playlist = new Playlist();
    playlist.name = playlistName;
    playlist.user = user;
    playlist.videos = []; // initially, no videos in the playlist

    // Save the playlist in the database
    await AppDataSource.manager.save(playlist);

    // Return success response
    res.status(200).json({ success: true, message: 'Playlist successfully created!' });
  } catch (error) {
    const err = error as any;
    if (err.code === 'SQLITE_CONSTRAINT') {
        // The constraint that failed is mentioned in the error message after "user."
        let failedConstraint = err.message.split('playlist.')[1];
        console.log(failedConstraint)
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
