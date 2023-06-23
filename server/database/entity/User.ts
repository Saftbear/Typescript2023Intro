import { Entity, PrimaryGeneratedColumn, Column, OneToMany  } from "typeorm"
import { Video } from "./Video";
import { Playlist } from "./Playlist";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @OneToMany(() => Video, video => video.user)
    videos: Video[];

    @OneToMany(() => Playlist, playlist => playlist.user)
    playlists: Playlist[];
}
