// routes/auth.ts
import { Router } from 'express';
import {AuthController} from '../Controller/';

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", AuthController.getMe);


export default router;