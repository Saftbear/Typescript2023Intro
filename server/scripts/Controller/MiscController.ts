import { Request, Response, RequestHandler } from "express";
import { MiscService } from "../Services/MiscService";
import { MulterRequest } from "../Interfaces/Requests";
import { IMiscService } from "../Interfaces/IMiscService";
import { VideoResponse } from "../types/Response";
export class MiscController {
  private miscService: MiscService;

  constructor(miscService: IMiscService) {
    this.miscService = miscService;
  }

  public getVideos: RequestHandler = async (req: Request, res: Response) => {
    try {
      const response: VideoResponse[] = await this.miscService.getVideos();
      if(response.length === 0){
        return res.status(404).json({ message: 'Videos not found' });
      }
  
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred while fetching videos' });
    }
  };

  public checkThumbnails: RequestHandler<{ fileName: string }> = async (req: Request, res: Response) => {
    try {
      const files: string[] = await this.miscService.checkThumbnails(req.params.fileName);
      if(files.length === 0){
        return res.status(404).json({ message: 'Files not found' });
      }
  
      return res.status(200).json({ thumbnails: files });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  public uploadThumbnail: RequestHandler = async (req: Request, res: Response) => {
    try {
      if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
      }
      const multerReq: MulterRequest = req as MulterRequest;
      const file: Express.Multer.File = multerReq.file;
  
      const filename:string = await this.miscService.uploadThumbnail(file);
      return res.status(200).json({ fileName: filename });
  
    } catch (err) {
      if ((err as Error).message === "No file uploaded") {
        res.status(400).json({ message: (err as Error).message });
      } else{
        return res.status(500).json({ message: (err as Error).message });
        }
      }
    }
}
