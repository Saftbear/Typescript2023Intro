import { Request, Response, RequestHandler } from 'express';
import { CreatePlaylistRequestBody } from '../Interfaces/Requests';
import { IPlaylistService } from '../Interfaces/IPlaylistService';
import { Playlist } from '../../database';
export class PlaylistController {
  private playlistService: IPlaylistService;

  constructor(playlistService: IPlaylistService) {
    this.playlistService = playlistService;
  }

  public getPlaylists: RequestHandler = async (req: Request, res: Response) => {
    try {
      const playlists: Playlist[] = await this.playlistService.getPlaylists();

      if (playlists.length === 0) {
        return res.status(404).json({ message: 'Playlists not found' });
      }

      res.status(200).json(playlists);
    } catch (error) {
      if ((error as Error).message === "Playlists not found") {
        return res.status(404).json({ message: "Playlists not found" });
      }
      res.status(500).send(error);
    }
  };

  public getVideosInPlaylist: RequestHandler<{ playlistid: string }> = async (req: Request, res: Response) => {
    try {
      const playlistId: number = Number(req.params.playlistid);

      if(Number.isNaN(playlistId)){
        return res.status(400).json({ message: "Invalid Playlist ID" });
      }

      const response = await this.playlistService.getPlaylistById(playlistId);

      res.status(200).json(response);
    } catch (error) {
      if ((error as Error).message === "Playlist not found") {
        return res.status(404).json({ message: "Playlist not found" });
      }
      res.status(500).send(error);
    }
  };

  public createPlaylists: RequestHandler = async (req: Request<{}, {}, CreatePlaylistRequestBody>, res: Response) => {
    try {
      const userid: number = Number(req.user?.id);
      const playlist: Playlist = await this.playlistService.createPlaylist(userid, req.body.playlistName);

      res.status(200).json({ success: true, message: 'Playlist successfully created!' });
    } catch (error) {
      const err = error as Error;
      switch (err.message) {
        case 'Invalid playlistName':
        case 'Invalid User ID':
          return res.status(400).json({ message: err.message });
        case 'User not found':
          return res.status(404).json({ message: err.message });
        case 'Playlist with that name already exists':
          return res.status(400).json({ message: err.message });
        case 'Error registering user':
        default:
          return res.status(500).json({ message: "Server Error" });
      }
    }
  };
}
