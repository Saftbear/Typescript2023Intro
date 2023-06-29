import { Router } from 'express';
import  {VideoController} from '../Controller/';
import { authMiddleware } from '../middleware';
import { upload, upload_thumbnails } from '../Services';
const router = Router();

router.post("/videos", authMiddleware, VideoController.createVideo);
router.post("/submit-form", authMiddleware, upload.single('file'), VideoController.submitForm);
router.post("/delete-video", authMiddleware, VideoController.deleteVideo);
router.get("/get-video",authMiddleware, VideoController.videoDetails);

export default router;
