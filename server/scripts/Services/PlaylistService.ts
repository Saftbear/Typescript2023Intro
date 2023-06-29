import { VideoResponse } from './../types/Response';
import { AppDataSource } from "../../database/data-source";
import { User, Video, Playlist } from '../../database';

export class PlaylistService {

    public static async getPlaylists(): Promise<Playlist[]>{
        const playlists = await AppDataSource.manager.find(Playlist, {
            relations: ["videos", "user"]
          });
        return playlists
    }

    public static async getPlaylistById(playlistId: number): Promise<VideoResponse[]> {
    
    const playlist = await AppDataSource.manager.findOne(Playlist, { where: { id: playlistId }, relations: ["videos", "videos.user"] });
    if (!playlist) {
      throw new Error("Playlist not found")
    }

    const videos = playlist.videos;

    const response: VideoResponse[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      path: video.path,
      user: video.user.username,
    }));
    return response;
    }
}

