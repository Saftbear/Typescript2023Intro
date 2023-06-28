import { User, Video } from '../../database/index';
import { AppDataSource } from "../../database/data-source";
import { Request, Response, NextFunction, RequestHandler } from "express"
import Misc from "../Services/createAdditional";
import { Playlist } from '../../database';
import fs from "fs"
import path from 'path';
import fsExtra from 'fs-extra';
import { MulterRequest, CreateVideoBody } from '../types/Requests';


export const videoDetails: RequestHandler = async (req: Request, res: Response) => {
  try{
  const videoPath = req.headers.path;

  if (typeof videoPath !== 'string') {
    return res.status(400).json({ message: "Invalid path" });
  }

  const video = await AppDataSource.manager.findOne(Video, { where: { path: videoPath }, relations: ["user", "playlists"] });
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.status(200).json(video);

  } catch(err){
    res.status(500).json({ message: "Error fetching video details", error: err });
  }
}

export const deleteVideo: RequestHandler<{ path: string }> = async (req: Request, res: Response) => {
  try {
    const videoPath = req.body.path;
    if(!videoPath){
      return res.status(400).json({ message: "videoPath not provided." });


    }
    // Find the video by path
    const video = await AppDataSource.manager.findOne(Video, { where: { path: videoPath } });

    if (!video) {
        return res.status(404).json({ message: "Video not found" });
    }

    // Remove the video from all playlists
    const playlists = await AppDataSource.manager.find(Playlist, { relations: ["videos"] });

    for (const playlist of playlists) {
        playlist.videos = playlist.videos.filter(video => video.path !== videoPath);
        await AppDataSource.manager.save(playlist);
    }

    await AppDataSource.manager.remove(video);

    try {
    fs.unlink(path.join(__dirname, `../../uploaded_files/uploads/${videoPath}`), (err) => {
        if (err) {
            console.error("Error deleting video file:", err);
            return res.status(500).json({ message: "Error deleting video file" });
        }
    })
  }
    catch(err) {
      console.error("Error deleting video:", err);
      return res.status(500).json({ message: "Error deleting thumbnail folder" });
  }

    try {
      console.log(`../../uploaded_files/Thumbnails/${videoPath.split('.').slice(0, -1).join('.')}`)
      await fsExtra.remove(path.join(__dirname, `../../uploaded_files/Thumbnails/${videoPath.split('.').slice(0, -1).join('.')}`));
  } catch(err) {
      console.error("Error deleting thumbnail folder:", err);
      return res.status(500).json({ message: "Error deleting thumbnail folder" });
  }
  try {
    await fsExtra.remove(path.join(__dirname, `../../uploaded_files/Preview/${videoPath.split('.').slice(0, -1).join('.')}`));
  } catch(err) {
      console.error("Error deleting Preview folder:", err);
      return res.status(500).json({ message: "Error deleting Preview folder" });
  }
  try {
    await fsExtra.remove(path.join(__dirname, `../../uploaded_files/ShortVideos/${videoPath.split('.').slice(0, -1).join('.')}`));
  } catch(err) {
      console.error("Error deleting Preview folder:", err);
      return res.status(500).json({ message: "Error deleting ShortVideos folder" });
  }

  return res.status(200).json({ message: "Successfully deleted video!" });

} catch (error) {
    return res.status(500).json({ message: "Error deleting video", error: error });
}
}
export const createVideo: RequestHandler = async (req: Request<{}, {}, CreateVideoBody>, res: Response, next: NextFunction) => {
  try {
      const { title, description, thumbnail, playlist } = req.body;
      const user = req.user; 
      if(!title || !description || !thumbnail){
        return res.status(400).json({ error: 'Error when getting details.' });
      }

      if(!user){
          return res.status(401).json({ error: 'Unauthorized' }); // redundant 
      } 

      const filename = req.headers.filename;
      if(!filename) {
          return res.status(400).json({ error: 'No filename provided' });
      }

      const video = await AppDataSource.manager.findOne(Video, { where: { path: filename as string} }) as Video;
      if (!video) {
          return res.status(404).json({ error: 'Video not found' });
      }
     
      if(playlist && playlist.length != 0) {
          const playlists = await AppDataSource.manager.createQueryBuilder(Playlist, "playlist")
          .where("playlist.id IN (:...ids)", { ids: playlist })
          .getMany();
          video.playlists = playlists;
      }

      video.title = title;
      video.description = description;
      video.thumbnail = thumbnail;
      video.user = user;
      const result = await AppDataSource.manager.save(video);

      return res.status(200).json({message: "There were no errors found."});
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while creating the video' });
  }
}


export const checkThumbnails: RequestHandler<{ fileName: string }> = async (req: Request, res: Response) => {

  try {
    const filename: string = req.params.fileName;
    if (!filename){
      return res.status(400).send('filename not provided.');
    }
    const thumbnailsFolder = `uploaded_files/Thumbnails/${filename}/`;

    const files = await fs.promises.readdir(thumbnailsFolder);
    return res.status(200).json({ thumbnails: files });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const uploadThumbnail: RequestHandler = async (req: Request, res: Response) => {
  const multerReq = req as MulterRequest;

  if (multerReq.fileValidationError) {
    return res.status(400).send(multerReq.fileValidationError);
  }

  const file= multerReq.file;

  try {
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    } else {
      console.log(file.filename)
      return res.status(200).json({ fileName: file.filename });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const submitForm: RequestHandler<any> = async (req: Request, res: Response) => {
  try {
    const multerReq = req as MulterRequest;

    const file = multerReq.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!multerReq.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const path: string = file.path;
    const filename: string = file.filename;
    const originalname: string = file.originalname;


    const misc = new Misc(path, filename);
    await misc.create_preview();
    await misc.createShortVideo();
    await misc.create_thumbnail();
    let duration: number | null =  misc.getDuration();

    if (duration == null){
      duration = 0;
    }

    const video: Video = new Video();
    video.title = originalname;
    video.description = "";
    video.duration = duration;
    video.path = filename;
    video.thumbnail = `${filename.split('.').slice(0, -1).join('.')}/screenshot_0.png`;
    video.user = multerReq.user;

    await AppDataSource.manager.save(video);

    return res.json({ fileName: filename, videoId: video.id });

  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while submitting the form' });
  }
};
