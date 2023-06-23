import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";
import { Playlist} from "./Playlist";

@Entity()
export class Video {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column( {unique: true} )
    path: string;

    @Column()
    duration: number;

    @Column()
    thumbnail: string;

    @ManyToOne(() => User, user => user.videos)
    user: User;

    @ManyToMany(() => Playlist, playlist => playlist.videos)
    @JoinTable()
    playlists: Playlist[];

    @Column({ default: false }) // default is public
    isPrivate: boolean;

}
