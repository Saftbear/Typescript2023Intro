
import { Playlist } from "../../database";
import { VideoResponse } from "../types/Response";

export interface IPlaylistService {
    getPlaylists(): Promise<Playlist[]>;
    getPlaylistById(playlistId: number): Promise<VideoResponse[]>;
    createPlaylist(userId: number, playlistName: string): Promise<Playlist>;
}