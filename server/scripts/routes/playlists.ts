import express from 'express';
import { PlaylistController } from '../Controller';
import { authMiddleware } from '../middleware';
import { PlaylistService } from '../Services/PlaylistService';

const miscService = new PlaylistService();
const miscController = new PlaylistController(miscService);

const router = express.Router();

router.get("/playlist", miscController.getPlaylists);
router.post("/create", authMiddleware, miscController.createPlaylists);
router.get("/playlist-videos/:playlistid", miscController.getVideosInPlaylist)

export default router;
