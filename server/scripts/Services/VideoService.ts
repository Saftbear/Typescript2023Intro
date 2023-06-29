import { AppDataSource } from "../../database/data-source";
import { User, Video, Playlist } from '../../database';
import fs from "fs"
import path from 'path';
import fsExtra from 'fs-extra';
import { CreateVideoBody } from '../types/Requests';

export class VideoService {

    public static async getVideoByPath(videoPath: string): Promise<Video>  {
        if (typeof videoPath !== 'string') {
            throw new Error("Invalid path");
        }
        let video

        try{
            video = await AppDataSource.manager.findOne(Video, { where: { path: videoPath }, relations: ["user", "playlists"] });
        }catch (err) {
            throw new Error('Database error');
        }      

        if (!video) {
            throw new Error("Video not found");
        }
        
        return video;
        }
        public static async getVideoById(id: number): Promise<Video> {
        if (Number.isNaN(id)) {
            throw new Error("Invalid id");
        }

        let video
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

    public static async deleteVideo(videoPath: string): Promise<boolean> {

        if (typeof videoPath !== 'string') {
            throw new Error("Invalid path");
        }

        const video = await this.getVideoByPath(videoPath);
        if (!video) {
            throw new Error('Video not found');
        }

        let playlists
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
        await this.deleteFiles(videoPath);

        return true;
    }

    private static async deleteFiles(videoPath: string): Promise<void>{
        try {
            fs.unlinkSync(path.join(__dirname, `../../uploaded_files/uploads/${videoPath}`));
            await fsExtra.remove(path.join(__dirname, `../../uploaded_files/Thumbnails/${videoPath.split('.').slice(0, -1).join('.')}`));
            await fsExtra.remove(path.join(__dirname, `../../uploaded_files/Preview/${videoPath.split('.').slice(0, -1).join('.')}`));
            await fsExtra.remove(path.join(__dirname, `../../uploaded_files/ShortVideos/${videoPath.split('.').slice(0, -1).join('.')}`));
        } catch (err) {
            throw new Error('Error deleting files');
        }
  }
    public static async createVideo(user: User, filename: string, body: CreateVideoBody): Promise<Video> {
        if (!user || !user.id) {
            throw new Error('Invalid user');
        }
        
        if (!filename) {
            throw new Error('Invalid filename');
        }
    
        let video;
        try {
            video = await AppDataSource.manager.findOne(Video, { where: { path: filename as string} }) as Video;
        } catch (err) {
            throw new Error('Database error finding video');
        }
    
        if (!video) {
            throw new Error('Video not found');
        }
    
        if(body.playlist && body.playlist.length != 0) {
            let playlists;
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
    
            video.playlists = playlists;
        }
    
        video.title = body.title;
        video.description = body.description;
        video.thumbnail = body.thumbnail;
        video.user = user;
    
        let result;
        try {
            result = await AppDataSource.manager.save(video);
        } catch (err) {
            throw new Error('Database error saving video');
        }
    
        return result;
    }
  

    public static async checkThumbnails(filename: string): Promise<string[]> {

    const thumbnailsFolder = `uploaded_files/Thumbnails/${filename}/`;
        try{
            const files = await fs.promises.readdir(thumbnailsFolder);
            return files;
        }
        catch(err){
            throw new Error('Folder could not be read');
        }
    }

    public static async uploadThumbnail(file: any) {
        if (!file) {
            throw new Error('No file uploaded');
        } else {
            return file.filename;
        }
    }

    public static async submitForm(file: any, user: User, misc: any): Promise<any> {
        if (!file) {
            throw new Error('No file uploaded');
        }

        if(!file.filename || !file.originalname){
            throw new Error('No filename or originalname');
        }

        const filename: string = file.filename;
        const originalname: string = file.originalname;

        try{
            await misc.create_preview();
            await misc.createShortVideo();
            await misc.create_thumbnail();
        }catch(err){
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

