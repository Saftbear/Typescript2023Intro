import express from 'express';
import authRoutes from './auth';
import videoRoutes from './video';
import miscRoutes from './misc';
import playlistRoutes from './playlists';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/video', videoRoutes);
router.use('/misc', miscRoutes);
router.use('/playlists', playlistRoutes);

export default router;
