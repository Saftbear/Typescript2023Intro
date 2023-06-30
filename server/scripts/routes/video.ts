import { Router } from 'express';
import  {VideoController} from '../Controller/';
import { authMiddleware } from '../middleware';
import { VideoService, upload } from '../Services';

const videoService = new VideoService();
const videoController = new VideoController(videoService);

const router = Router();



router.post("/videos", authMiddleware, videoController.createVideo);
router.post("/submit-form", authMiddleware, upload.single('file'), videoController.submitForm);
router.post("/delete-video", authMiddleware, videoController.deleteVideo);
router.get("/get-video/:videoPath", videoController.videoDetails);

export default router;
