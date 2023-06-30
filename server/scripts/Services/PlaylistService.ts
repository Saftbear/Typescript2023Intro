import { VideoResponse } from './../types/Response';
import { AppDataSource } from "../../database/data-source";
import { Playlist, User, Video } from '../../database';

import { IPlaylistService } from '../Interfaces/IPlaylistService';

export class PlaylistService implements IPlaylistService{

    public async getPlaylists(): Promise<Playlist[]>{
        const playlists: Playlist[] = await AppDataSource.manager.find(Playlist, {
            relations: ["videos", "user"]
          });

          if (!playlists || playlists.length === 0) {
            throw new Error("No playlists found");
          }
          playlists.forEach(playlist => {
            if (!playlist.user) {
                playlist.user = new User(); 
                playlist.user.username = "default_username";
                playlist.user.email = "default_email@email.com";
            }
        });
    
   
        return playlists
    }

    public async getPlaylistById(playlistId: number): Promise<VideoResponse[]> {
    
    const playlist: Playlist | null = await AppDataSource.manager.findOne(Playlist, { where: { id: playlistId }, relations: ["videos", "videos.user"] });
    if (!playlist) {
      throw new Error("Playlist not found")
    }

    const videos: Video[] = playlist.videos;

    const response: VideoResponse[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      path: video.path,
      user: video.user.username,
    }));
    return response;
    }

    public async createPlaylist(userId: number, playlistName: string): Promise<Playlist> {

      if(!playlistName){
        throw new Error("Invalid playlistName");
      }
  
      if(Number.isNaN(userId)){
        throw new Error("Invalid User ID");
      }
  
      const user: User = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;
  
      if (!user) {
        throw new Error('User not found');
      }
  
      const playlist: Playlist = new Playlist();
      playlist.name = playlistName;
      playlist.user = user;
      playlist.videos = [];
  
      try {
          await AppDataSource.manager.save(playlist);
      } catch (error) {
          const err = error as any;
          if (err.code === 'SQLITE_CONSTRAINT') {
              let failedConstraint = err.message.split('playlist.')[1];
              if (failedConstraint == "name")
              {
                throw new Error("Playlist with that name already exists");
              }
              else{
                throw new Error("Error registering user");
              }
          }
      }
  
      return playlist;
    }

}

