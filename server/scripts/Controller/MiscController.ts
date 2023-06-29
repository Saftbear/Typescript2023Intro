import { Request, Response, RequestHandler } from "express"

import { MiscService } from "../Services/MiscService";
import { MulterRequest } from "../types/Requests";


export const getVideos: RequestHandler = async (req: Request, res: Response) => {
  try {
    const response = await MiscService.getVideos();
    if(response.length === 0){
      return res.status(404).json({ error: 'Videos not found' });
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching videos' });
  }
};

export const checkThumbnails: RequestHandler<{ fileName: string }> = async (req: Request, res: Response) => {
  try {
    const files = await MiscService.checkThumbnails(req.params.fileName);
    return res.status(200).json({ thumbnails: files });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}

export const uploadThumbnail: RequestHandler = async (req: Request, res: Response) => {
  try {

    const multerReq = req as MulterRequest;
    const file = multerReq.file;

    const filename = await MiscService.uploadThumbnail(file);
    return res.status(200).json({ fileName: filename });
  } catch (err) {
    if ((err as Error).message === "No file uploaded") {
      res.status(400).json({ error: (err as Error).message });
    } else{
      return res.status(500).json({ error: (err as Error).message });
      }
    }
  }

