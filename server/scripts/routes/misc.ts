import express from 'express';
import { MiscController } from '../Controller';
import { authMiddleware } from '../middleware';
import { upload_thumbnails } from '../Services';
import {MiscService} from '../Services/MiscService';
const miscService = new MiscService();
const miscController = new MiscController(miscService);
const router = express.Router();

router.get("/get-videos", miscController.getVideos);
router.get("/check-thumbnails/:fileName", miscController.checkThumbnails);
router.post("/upload-thumbnail", authMiddleware, upload_thumbnails.single('file'), miscController.uploadThumbnail);

export default router;
