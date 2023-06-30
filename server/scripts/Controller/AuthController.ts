import { Request, Response, RequestHandler } from "express";
import AuthService from "../Services/AuthService";
import { IAuthService } from "../Interfaces/IAuthService";
import { LoginResponse } from '../types/Response';
import { User } from "../../database";
export class AuthController {
  private authService: AuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public register: RequestHandler = async (req: Request, res: Response) => {
    try {
      const user: User = await this.authService.registerUser(req.body);
      return res.status(200).json({ message: "User registered successfully", id: user.id, success: true });
    } catch (error) {
      if ((error as Error).message === 'Missing parameters') {
        return res.status(400).json({ message: "Username, password, and email are all required", success: false });
      }
      if ((error as Error).message === 'Database error - user already exists') {
        return res.status(400).json({ message: "Username already exists", success: false });
      }
      return res.status(500).json({ message: "Server Error", success: false });
    }
  };

  public login: RequestHandler = async (req: Request, res: Response) => {
    try {
      const result: LoginResponse = await this.authService.loginUser(req.body.username, req.body.password);
      return res.json({ message: "User logged in successfully", token: result.token, user: result.user, success: true });
    } catch (error) {
      if ((error as Error).message === 'Missing parameters') {
        return res.status(400).json({ message: "Username and password are required", success: false });
      }
      if ((error as Error).message === 'Invalid Username or Password') {
        return res.status(401).json({ message: "Invalid Username or Password", success: false });
      }
      return res.status(500).json({ message: "Server Error", success: false });
    }
  };

  public getMe: RequestHandler = async (req: Request, res: Response) => {
    try {
      const token: string | undefined = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      }
      const user = await this.authService.getMe(token);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    } catch (error) {
      if ((error as Error).message === 'No token provided') {
        return res.status(401).json({ error: 'Unauthorized', success: false });
      }
      return res.status(500).json({ message: 'Server Error', success: false });
    }
  };
}
