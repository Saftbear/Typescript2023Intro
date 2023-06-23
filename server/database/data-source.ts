import "reflect-metadata"
import { DataSource } from "typeorm"
import { User, Video, Playlist } from "../database";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "myDatabase.sqlite",
    synchronize: true,
    logging: false,
    entities: [
        User, Playlist, Video
    ]
  })