import { AuthController } from './../Controller/AuthController';
import { Router } from 'express';
import AuthService from '../Services/AuthService';

const authService = new AuthService();
const authController = new AuthController(authService);

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authController.getMe);


export default router;