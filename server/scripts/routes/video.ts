// routes/video.ts
import { Router } from 'express';
import  {VideoController} from '../Controller/';
import { authMiddleware } from '../middleware';
import { upload, upload_thumbnails } from '../utils';
const router = Router();

router.post("/videos",authMiddleware, VideoController.createVideo);
router.get("/check-thumbnails/:fileName", VideoController.checkThumbnails);
router.post("/upload-thumbnail", authMiddleware, upload_thumbnails.single('file'), VideoController.uploadThumbnail);
router.post("/submit-form", authMiddleware, upload.single('file'), VideoController.submitForm);
router.post("/delete-video", authMiddleware, VideoController.deleteVideo);
router.get("/get-video", authMiddleware, VideoController.videoDetails);

export default router;
