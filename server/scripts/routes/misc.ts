import { videoDetails } from './../Controller/VideoController';
import express from 'express';
import { MiscController } from '../Controller';

const router = express.Router();

router.get("/get-videos", MiscController.getVideos);
router.post("/createMisc", MiscController.createMisc);
router.get("/video-details", MiscController.getVideoDetails);
export default router;
