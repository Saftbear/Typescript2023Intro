
import { Video } from "../../database";

export type VideoResponse = {
    id: number;
    title: string;
    thumbnail: string;
    path: string;
    user: string;
  };

  
  export type PlaylistResponse = {
    id: number;
    title: string;
    thumbnail: string;
    path: string;
    user: string;
  };