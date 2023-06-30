
import { CreateVideoBody } from './Requests';
import { Video, User} from '../../database';

export interface IVideoService {
    getVideoByPath(videoPath: string): Promise<Video>;
    getVideoById(id: number): Promise<Video>;
    deleteVideo(videoPath: string): Promise<boolean>;
    createVideo(user: User, filename: string, body: CreateVideoBody): Promise<Video>;
    submitForm(file: Express.Multer.File, user: User, misc: any): Promise<any>;
}