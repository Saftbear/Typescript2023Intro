import express from 'express';
import { MiscController } from '../Controller';
import { authMiddleware } from '../middleware';
import { upload_thumbnails } from '../Services';
const router = express.Router();

router.get("/get-videos", MiscController.getVideos);
router.get("/check-thumbnails/:fileName", MiscController.checkThumbnails);
router.post("/upload-thumbnail", authMiddleware, upload_thumbnails.single('file'), MiscController.uploadThumbnail);

export default router;
