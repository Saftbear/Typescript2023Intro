
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany  } from "typeorm"
import { User } from "./User";
import { Video } from "./Video";
@Entity()
export class Playlist {

    @PrimaryGeneratedColumn()
    id: number;

    @Column( {unique: true} )
    name: string;

    @ManyToOne(() => User, user => user.playlists)
    user: User;

    @ManyToMany(() => Video, video => video.playlists)
    videos: Video[];

    @Column({ default: false }) // default is public
    private: boolean;

}
