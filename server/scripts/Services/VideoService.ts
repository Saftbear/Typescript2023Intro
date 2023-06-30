import { AppDataSource } from "../../database/data-source";
import { User, Video, Playlist } from '../../database';
import fs from "fs"
import path from 'path';
import fsExtra from 'fs-extra';
import { CreateVideoBody } from '../Interfaces/Requests';
import { IVideoService } from "../Interfaces/IVideoService";
import {SubmitFormResponse} from '../types/Response';

export class VideoService implements IVideoService{

    public  async getVideoByPath(videoPath: string): Promise<Video>  {
        if (typeof videoPath !== 'string') {
            throw new Error("Invalid path");
        }
        let video: Video | null;

        try{
            video = await AppDataSource.manager.findOne(Video, { where: { path: videoPath }, relations: ["user", "playlists"] });
        }catch (err) {
            throw new Error('Database error');
        }      

        if (video) {
            if (!video.user) {
                video.user = new User();
                video.user.username = "default_username";
                video.user.email = "default_email@email.com";
              } 
        } else {
            throw new Error("Video not found");
        }

        return video;
        }

        public  async getVideoById(id: number): Promise<Video> {
        if (Number.isNaN(id)) {
            throw new Error("Invalid id");
        }

        let video: Video | null;
        try{
            video = await AppDataSource.manager.findOne(Video, { where: { id: id }, relations: ["user", "playlists"] });

        }catch (err) {
            throw new Error('Database error');
        }
        
        if (!video) {
            throw new Error("Video not found");
        }
        
        return video;
        } 

    public async deleteVideo(videoPath: string): Promise<boolean> {

        if (typeof videoPath !== 'string') {
            throw new Error("Invalid path");
        }

        const video: Video = await this.getVideoByPath(videoPath);
        if (!video) {
            throw new Error('Video not found');
        }

        let playlists: Playlist[]
        try{
            playlists = await AppDataSource.manager.find(Playlist, { relations: ["videos"] });
        }catch (err) {
            throw new Error('Database error finding playlist');
        }

        if (!playlists) {
            throw new Error('Playlists not found');
        }

        for (const playlist of playlists) {
            playlist.videos = playlist.videos.filter(video => video.path !== videoPath);
            try{
                await AppDataSource.manager.save(playlist);
            }catch (err) {
                throw new Error('Database error saving playlist');
            }
        }
        try{
            await AppDataSource.manager.remove(video);
        }catch (err) {
            throw new Error('Database error removing video');
        }
        await VideoService.deleteFiles(videoPath)
        return true;
    }

    private static async deleteFiles(videoPath: string): Promise<void>{
        try {
            const uploadsPath:string = path.join(__dirname, "../../uploaded_files/uploads", videoPath);
            const thumbnailsPath:string = path.join(__dirname, "../../uploaded_files/Thumbnails", videoPath.split('.').slice(0, -1).join('.'));
            const previewPath:string = path.join(__dirname, "../../uploaded_files/Preview", videoPath.split('.').slice(0, -1).join('.'));
            const shortVideosPath:string = path.join(__dirname, "../../uploaded_files/ShortVideos", videoPath.split('.').slice(0, -1).join('.'));
        
            if (fs.existsSync(uploadsPath)) {
              fs.unlinkSync(uploadsPath);
            }
            if (fs.existsSync(thumbnailsPath)) {
              await fsExtra.remove(thumbnailsPath);
            }
            if (fs.existsSync(previewPath)) {
              await fsExtra.remove(previewPath);
            }
            if (fs.existsSync(shortVideosPath)) {
              await fsExtra.remove(shortVideosPath);
            }
          } catch (err) {
            throw new Error("Error deleting files");
          }
  }
    public  async createVideo(user: User, filename: string, body: CreateVideoBody): Promise<Video> {
        if (!user || !user.id) {
            throw new Error('Invalid user');
        }
        
        if (!filename) {
            throw new Error('Invalid filename');
        }
        if (!body.title || typeof body.title !== 'string') {
            throw new Error('Invalid title');
          }
        
          if (!body.description || typeof body.description !== 'string') {
            throw new Error('Invalid description');
          }
        
          if (!body.thumbnail || typeof body.thumbnail !== 'string') {
            throw new Error('Invalid thumbnail');
          }
        
        let video: Video;
        try {
            video = await AppDataSource.manager.findOne(Video, { where: { path: filename as string} }) as Video;
        } catch (err) {
            throw new Error('Database error finding video');
        }
    
        if (!video) {
            throw new Error('Video not found');
        }
        let playlists: Playlist[] = [];
        if(body.playlist && body.playlist.length != 0) {
            
            try {
                playlists = await AppDataSource.manager.createQueryBuilder(Playlist, "playlist")
                .where("playlist.id IN (:...ids)", { ids: body.playlist })
                .getMany();
            } catch (err) {
                throw new Error('Database error finding playlists');
            }
            
            if (playlists.length !== body.playlist.length) {
                throw new Error('No playlist found');
            }
    
            
        }


        video.playlists = playlists;
        video.title = body.title;
        video.description = body.description;
        video.thumbnail = body.thumbnail;
        video.user = user;
    
        let result: Video;
        try {
            result = await AppDataSource.manager.save(video);
        } catch (err) {
            throw new Error('Database error saving video');
        }
    
        return result;
    }
  

    public async submitForm(file: Express.Multer.File, user: User, misc: any): Promise<SubmitFormResponse> {
        if (!file) {
            throw new Error('No file uploaded');
        }

        if(!file.filename || !file.originalname){
            throw new Error('No filename or originalname');
        }
        if (file.originalname.length > 60) {
            let fileExtension = file.originalname.split('.').pop();  
            if(fileExtension === undefined){
                throw new Error('Interal Server Error');
            }

            let nameWithoutExtension = file.originalname.slice(0, file.originalname.length - fileExtension.length - 1);  
            let maxLength = 60 - fileExtension.length - 1; 
        
            if (nameWithoutExtension.length > maxLength) {
                nameWithoutExtension = nameWithoutExtension.slice(nameWithoutExtension.length - maxLength);
            }
        
            // Combine shortened name with extension
            file.originalname = `${nameWithoutExtension}.${fileExtension}`;
        }
        const filename: string = file.filename;
        const originalname: string = file.originalname;

        try{
            await misc.create_preview();
            await misc.createShortVideo();
            await misc.create_thumbnail();
        }catch(err){
            try {
                await VideoService.deleteFiles(filename);
              } catch (deleteErr) {
                console.error("Error deleting files:", deleteErr);
              }
            throw new Error('Error creating video:');
        }

        let duration: number | typeof NaN =  misc.getDuration();

        if (Number.isNaN(duration)){
            throw new Error('Invalid metadata');
        }

        const video: Video = new Video();
        video.title = originalname;
        video.description = "";
        video.duration = duration;
        video.path = filename;
        video.thumbnail = `${filename.split('.').slice(0, -1).join('.')}/screenshot_0.png`;
        video.user = user;

        try {
            await AppDataSource.manager.save(video);
        } catch (err) {
            throw new Error('Database error saving video');
        }

        return { fileName: filename, videoId: video.id };
    }
}

