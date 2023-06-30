import { User } from "../../database";
import { Request } from 'express';

export interface MulterRequest extends Request {
    file: Express.Multer.File; 
    user?: User;
    fileValidationError?: string;
  }
  
export interface CreateVideoBody {
    title: string;
    description: string;
    thumbnail: string;
    playlist: string[];
  }

export interface CreatePlaylistRequestBody {
    playlistName: string;
  }

export  interface JWTPayload {
    id: number;
    iat: number;
    exp: number;
  }