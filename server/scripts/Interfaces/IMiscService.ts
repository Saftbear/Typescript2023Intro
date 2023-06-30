
import { VideoResponse } from '../types/Response';

export interface IMiscService {
    getVideos(): Promise<VideoResponse[]>;
    checkThumbnails(filename: string): Promise<string[]>;
    uploadThumbnail(file: Express.Multer.File): Promise<string>;

}