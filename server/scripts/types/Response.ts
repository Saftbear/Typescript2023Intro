
import { User } from "../../database";

export type VideoResponse = {
    id: number;
    title: string;
    thumbnail: string;
    path: string;
    user: string;
  };

export  type LoginResponse = {
    token: string;
    user: User;
  };

export type SubmitFormResponse = {
    fileName: string;
    videoId: number; 
  };