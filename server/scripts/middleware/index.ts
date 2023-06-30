import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../../database'; 
import { AppDataSource } from "../../database/data-source";


const secretKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;
  if (authHeader) {
    const parts: string[] = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Token error: invalid token format.' });
    }
    const token:string = parts[1];
    try {
      const payload:string| JwtPayload = jwt.verify(token, secretKey);
      
      if (typeof payload !== "object" || payload === null) {
        return res.status(401).json({ message: 'Token error: invalid payload type.' });
      }
      
      const userId: number = payload.id;
      const user: User = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;
      if (!user) {

        return res.status(401).json({ message: 'Invalid token: no such user.' });
      }

      req.user = user;

      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired.' });
      }
      return res.status(401).json({ message: 'Invalid token: verification failed.', error: err});
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
};