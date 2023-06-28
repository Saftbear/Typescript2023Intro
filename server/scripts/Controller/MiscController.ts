import { Request, Response, RequestHandler } from "express"
import Misc from "../Services/createAdditional";
import { Video } from "../../database";
import { AppDataSource } from "../../database/data-source";
import { VideoResponse } from "../types/Response";

export const createMisc: RequestHandler = async (req: Request, res: Response) => {

  try {
    const { path, filename } = req.body;

    if (!path) {
      return res.status(400).json({ message: "Invalid path" });
    }
  
    if (!filename) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const misc = new Misc(path, filename);
    await misc.create_preview();
    await misc.createShortVideo();
    await misc.create_thumbnail();
    let duration: number | null =  misc.getDuration();
    if (duration == null){
      duration = 0;
    }

    const video = new Video();

    video.title = filename;
    video.description = "";
    video.duration = duration;
    video.path = path;
    video.thumbnail = "screenshot_0.png";

    // save video in database here

    res.status(200).json({ message: "Misc created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating Misc" });
  }
};



export const getVideos: RequestHandler = async (req: Request, res: Response) => {
  try {
    const videos: Video[] = await AppDataSource.manager.find(Video, {
      select: ["id", "title", "thumbnail", "path"], // We only select the required fields
      relations: ["user"], // This is needed to get the user who created the video
    });
    
    if (!videos || videos.length === 0) {
      return res.status(404).json({ error: "No videos found" });
    }
  
    const response: VideoResponse[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      path: video.path,
      user: video.user.username,
    }));
  
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching videos' });
  }
};

export const getVideoDetails: RequestHandler = async (req: Request, res: Response) => {
try {
  const filename = req.headers.filename;

  if (!filename) {
    return res.status(400).json({ error: 'No filename provided' });
  }

  const video = await AppDataSource.manager.findOne(Video, { where: { path: filename as string} }) as Video;

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
}
  return res.status(200).json({response: "ok", video: video});
} catch (error) {
  return res.status(500).json({ error: 'An error occurred while fetching video Details' });

}

}