
import { Request, Response, NextFunction, RequestHandler } from "express"
import Misc from "../Services/createAdditional";

import { MulterRequest, CreateVideoBody } from '../types/Requests';
import { VideoService } from '../Services/VideoService';


export const videoDetails: RequestHandler = async (req: Request, res: Response) => {
  try {

    const videoPath = req.headers.path;

    if (typeof videoPath !== 'string') {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const video = await VideoService.getVideoByPath(videoPath);
    res.status(200).json(video);
  } catch (err) {
    if ((err as Error).message === "Invalid path") {
      res.status(400).json({ error: (err as Error).message });
    } else if ((err as Error).message === "Video not found") {
      res.status(404).json({ error: (err as Error).message });
    } else {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}

export const deleteVideo: RequestHandler<{ path: string }> = async (req: Request, res: Response) => {
  try {

    const videoPath = req.body.path;
    if(!videoPath){
      return res.status(400).json({ message: "videoPath not provided." });
    }
    await VideoService.deleteVideo(videoPath);
    return res.status(200).json({ message: "Successfully deleted video!" });
  } catch (err) {
    if ((err as Error).message === "Invalid path") {
      res.status(400).json({ error: (err as Error).message });
    } else if ((err as Error).message === "Video not found" || (err as Error).message === "Playlists not found") {
      res.status(404).json({ error: (err as Error).message });
    }else {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

}

export const createVideo: RequestHandler = async (req: Request<{}, {}, CreateVideoBody>, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' }); 
    }
    const filename = req.headers.filename;

    if (typeof filename !== 'string') {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const result = await VideoService.createVideo(user, filename, req.body);

    return res.status(200).json(result);
  } catch (err) {
    if ((err as Error).message === "Invalid path" || (err as Error).message === "Invalid filename") {
      res.status(400).json({ error: (err as Error).message });
    } else if ((err as Error).message === "Video not found" || (err as Error).message === "Playlists not found") {
      res.status(404).json({ error: (err as Error).message });
    }else {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}


export const uploadThumbnail: RequestHandler = async (req: Request, res: Response) => {
  try {

    const multerReq = req as MulterRequest;
    const file = multerReq.file;

    const filename = await VideoService.uploadThumbnail(file);
    return res.status(200).json({ fileName: filename });
  } catch (err) {
    if ((err as Error).message === "No file uploaded") {
      res.status(400).json({ error: (err as Error).message });
    } else{
      return res.status(500).json({ error: (err as Error).message });
      }
    }
  }


export const submitForm: RequestHandler<any> = async (req: Request, res: Response) => {
  try {
    
    const multerReq = req as MulterRequest;
    const file = multerReq.file;
    if(!file){
      return res.status(400).json({ message: "File not provided." });
    }

    if (!multerReq.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const misc = new Misc(file.path, file.filename);
    const result = await VideoService.submitForm(file, multerReq.user, misc);
    return res.status(200).json(result);
  } catch (err) {
    if ((err as Error).message === "No file uploaded" || (err as Error).message === 'No filename or originalname') {
      res.status(400).json({ error: (err as Error).message });
    } else{
      return res.status(500).json({ error: (err as Error).message });
      }
    }
}

