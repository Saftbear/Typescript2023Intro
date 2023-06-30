import { AppDataSource } from "../../database/data-source";
import { Video } from '../../database';
import fs from "fs"
import { VideoResponse } from '../types/Response';
import { IMiscService } from "../Interfaces/IMiscService";
export class MiscService implements IMiscService{

    public async getVideos(): Promise<VideoResponse[]>{
    
        const videos: Video[] = await AppDataSource.manager.find(Video, {
            select: ["id", "title", "thumbnail", "path"],
            relations: ["user"], 
          });
          
          if (!videos || videos.length === 0) {
            throw new Error("No videos found");
          }
          const response: VideoResponse[] = videos.map(video => ({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            path: video.path,
            user: video.user?.username ?? "default_username",
          }));
          return response;
    }
    public async checkThumbnails(filename: string): Promise<string[]> {

    const thumbnailsFolder: string = `uploaded_files/Thumbnails/${filename}/`;
        try{
            const files:string[] = await fs.promises.readdir(thumbnailsFolder);
            return files;
        }
        catch(err){
            throw new Error('Folder could not be read');
        }
    }

    public async uploadThumbnail(file: Express.Multer.File): Promise<string> {
      if (!file) {
          throw new Error('No file uploaded');
      } else {
          return file.filename;
      }
  }

}

