import { Request, Response, NextFunction } from "express";
import { CreateVideoBody } from '../Interfaces/Requests';
import { IVideoService } from "../Interfaces/IVideoService";
import Misc from "../Services/createAdditional";
import { RequestHandler } from "express";
import { MulterRequest } from "../Interfaces/Requests";
import { User, Video } from "../../database";
import { SubmitFormResponse } from "../types/Response";
export class VideoController {
  private videoService: IVideoService;

  constructor(videoService: IVideoService) {
    this.videoService = videoService;
  }

  public videoDetails: RequestHandler<{ videoPath: string }> = async (req: Request, res: Response) => {
    try {
      const videoPath: string = req.params.videoPath
  
      if (typeof videoPath !== 'string') {
        return res.status(400).json({ message: 'Invalid filename' });
      }
      const video = await this.videoService.getVideoByPath(videoPath);
      res.status(200).json(video);
    } catch (err) {
      if ((err as Error).message === "Invalid path") {
        return res.status(400).json({ message: (err as Error).message });
      } else if ((err as Error).message === "Video not found") {
        return res.status(404).json({ message: (err as Error).message });
      } else {
        return res.status(500).json({ message: (err as Error).message });
      }
    }
  }

  public deleteVideo: RequestHandler<{ path: string }> = async (req: Request, res: Response) => {
    try {

      const videoPath: string = req.body.path;
      if(!videoPath){
        return res.status(400).json({ message: "videoPath not provided." });
      }
  
      await this.videoService.deleteVideo(videoPath);
      return res.status(200).json({ message: "Successfully deleted video!" });
    } catch (err) {
      if ((err as Error).message === "Invalid path") {
        return res.status(400).json({ message: (err as Error).message });
      } else if ((err as Error).message === "Video not found" || (err as Error).message === "Playlists not found") {
        return res.status(404).json({ message: (err as Error).message });
      }else {
        return res.status(500).json({ message: (err as Error).message });
      }
    }
  }

  public createVideo: RequestHandler = async (req: Request<{}, {}, CreateVideoBody>, res: Response, next: NextFunction) => {
    try {
   

      const user: User | undefined = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' }); 
      }
      console.log(req.user)
      const filename: string = req.headers.filename as string;
      if (typeof filename !== 'string') {
        return res.status(400).json({ message: 'Invalid filename' });
      }
  
      const result: Video = await this.videoService.createVideo(user, filename, req.body);
  
      return res.status(200).json(result);
    } catch (err) {
      if ((err as Error).message === "Invalid path" || (err as Error).message === "Invalid filename") {
        return res.status(400).json({ message: (err as Error).message });
      } else if ((err as Error).message === "Video not found" || (err as Error).message === "Playlists not found") {
        return res.status(404).json({ message: (err as Error).message });
      }else {
        return res.status(500).json({ message: (err as Error).message });
      }
    }

  }

  public  submitForm: RequestHandler<any> = async (req: Request, res: Response) => {
    try {
      if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
      }
      const multerReq: MulterRequest = req as MulterRequest;
      const file: Express.Multer.File = multerReq.file;
      if(!file){
        return res.status(400).json({ message: "File not provided." });
      }
  
      if (!multerReq.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const misc = new Misc(file.path, file.filename);
  
      const result:SubmitFormResponse = await this.videoService.submitForm(file, multerReq.user, misc);
      return res.status(200).json(result);
    } catch (err) {
      if ((err as Error).message === "No file uploaded" || (err as Error).message === 'No filename or originalname') {
        return res.status(400).json({ message: (err as Error).message });
      } else{
        return res.status(500).json({ message: (err as Error).message });
        }
      }
  }
}
