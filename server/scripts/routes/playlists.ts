import express from 'express';
import { PlaylistController } from '../Controller';

const router = express.Router();

router.get("/playlist", PlaylistController.getPlaylists);
router.post("/create", PlaylistController.createPlaylists);
router.get("/playlist-videos", PlaylistController.getVideosInPlaylist)

export default router;
