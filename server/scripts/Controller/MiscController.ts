import { Request, Response } from "express"
import Misc from "../utils/create_misc";
import { Video } from "../../database";
import { AppDataSource } from "../../database/data-source";
import { VideoResponse } from "../types/Response";


export const createMisc = async (req: Request, res: Response) => {
  const { path, filename } = req.body;

  try {
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



export const getVideos = async (req: Request, res: Response) => {
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
  
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching videos' });
  }
};