import ffmpeg from "fluent-ffmpeg";
import fs from "fs"
import { FfprobeData } from 'fluent-ffmpeg';
import { FfmpegWrapper, IFfmpegWrapper } from "./ffmpegWrapper";
import { MiscType } from "../types/Misc";

class InvalidFilenameError extends Error {
    constructor(message?: string) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
  
  class DirectoryError extends Error {
    constructor(message?: string) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }

class Misc implements MiscType{
    private path: string;
    private filename: string;
    private duration: number | 0;
    private ffmpegWrapper: IFfmpegWrapper;


    // Constructor
    constructor(path: string, filename: string, ffmpegWrapper?: IFfmpegWrapper) {
        if (!path) {
            throw new Error("Path must be provided");
        }
        if (!filename) {
            throw new Error("Filename must be provided");
        }
        this.duration = 0;
        this.path = path;
        this.filename = filename;
        this.ffmpegWrapper = ffmpegWrapper || new FfmpegWrapper();
    }

    public directoryExistsOrCreate(path: string): boolean {
        try {
            if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
                return true;
            } else {
                try{
                    fs.mkdirSync(path, { recursive: true });
                    return true;
                }catch(err){
                    return false;
                }
      
            }
        } catch {
            return false;
        }
    }


    // Creating Thumbnail choice
    public async create_thumbnail(path_?: string, filename_?: string): Promise<void> {
        const path = path_ ?? this.path;
        const filename = filename_ ?? this.filename;
        const save_path: string = 'uploaded_files/Thumbnails/';

        if (!filename.includes('.')) {
            throw new InvalidFilenameError(`Invalid filename. Filename must contain a dot.`);
        }

        // create thumbnail folder
        if (!this.directoryExistsOrCreate(save_path)) {
            throw new Error(`Could not access or create directory "${save_path}"`);
        }

        if (this.duration == 0) {
            await this.setDuration(path);
        }
        const interval: number = this.duration / 5;
        const thumbnailPath: string = `${save_path}${filename.split('.').slice(0, -1).join('.')}`;

        // create folder in thumbnail with filename
        if (!this.directoryExistsOrCreate(thumbnailPath)) {
            throw new Error(`Could not access or create directory "${thumbnailPath}"`);
        }
        
        // take 5 screenshots 
        const promises: Promise<void>[] = [];
        for (let i: number = 0; i <= 5; i++) {
          const timeMark: number = i * interval;
          const thumbnailName: string = `screenshot_${i}.png`;
          promises.push(this.ffmpegWrapper.generateThumbnail(path, thumbnailPath, timeMark, thumbnailName));
        }
        try {

          await Promise.all(promises);

        } catch (err) {
          throw new Error(`Error generating thumbnails: ${err}`);
        }
    }

    // Creating timeline preview 
    public async create_preview(path?: string, filename?: string): Promise<void> {
        path = path ?? this.path;
        filename = filename ?? this.filename;
        let save_path: string = 'uploaded_files/Preview/';

        if (!filename.includes('.')) {
            throw new InvalidFilenameError(`Invalid filename. Filename must contain a dot.`);
        }
        // create folder with Filename
        if (!this.directoryExistsOrCreate(save_path)) {
            throw new DirectoryError(`Could not access or create directory "${save_path}"`);
        }
    
        const fps: number = 0.5;
        const previewPath: string = `${save_path}${filename.split('.').slice(0, -1).join('.')}`;
    
        /// create folder with Filename
        if (!this.directoryExistsOrCreate(previewPath)) {
            throw new Error(`Could not access or create directory "${previewPath}"`);
        }

        try {
            return await this.ffmpegWrapper.createPreview(path, previewPath, fps);
        } catch (err) {
            throw new DirectoryError(`Error generating previews: ${err}`);
        }

    }    

    


    // Creating short video
    public async createShortVideo(path?: string, filename?: string): Promise<void> {
        path = path ?? this.path;
        filename = filename ?? this.filename;
    
        const save_path = 'uploaded_files/ShortVideos/';
        
        if (!filename.includes('.')) {
            throw new InvalidFilenameError(`Invalid filename. Filename must contain a dot.`);
        }

        if (!this.directoryExistsOrCreate(save_path)) {
            throw new DirectoryError(`Could not access or create directory "${save_path}"`);
        }

        const clipPath: string = `${save_path}${filename.split('.').slice(0, -1).join('.')}`;
        try {
            await fs.promises.access(clipPath, fs.constants.F_OK | fs.constants.W_OK);
        } catch (err) {
            fs.mkdirSync(clipPath);
        }

        const num_clips = 15;
    
        if (!this.directoryExistsOrCreate(clipPath)) {
            throw new DirectoryError(`Could not access or create directory "${clipPath}"`);
        }

    
        const interval = this.duration / num_clips;     
    
        let clips = new Array(); 
    
        // Generate clips
        for(let i = 0; i < num_clips; i++) {
            let start_time = i * interval;
            const output_filename = `${clipPath}/clip_${i}.mp4`;
            try {
                await this.ffmpegWrapper.createShortVideoClip(path, start_time, output_filename);
                clips.push(output_filename);
            } catch(err) {
                throw new Error(`Error generating short video clip: ${err}`);
            }
        }
    
      
        const outputPath = `${clipPath}/output.mp4`;

        try {
            await this.ffmpegWrapper.mergeShortVideoClips(clips, outputPath, clipPath);
        } catch(err) {
            throw new Error(`Error merging short video clips: ${err}`);
        }

        try {
            clips.forEach((clip) => {
                fs.unlink(clip, (err) => {
                    if (err) {
                        throw new Error(`Error: ${err}`);
                    }
                });
            });
    
        } catch (err) {
            throw new Error(`Failed to create short Video: ${err}`);
        }
    
    }
    
    public async setDuration(path: string): Promise<void> {


        try {
            this.duration = await this.ffmpegWrapper.setDuration(path);
        } catch (err) {
            throw new Error(`Error setting duration: ${err}`);
        }
    }

    public getDuration(){
        return this.duration;
    }

}

export default Misc;


