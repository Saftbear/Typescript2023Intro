import { User } from '../database';
import express from "express";
import cors from "cors";
import "reflect-metadata";
import { AppDataSource } from "../database/data-source";
import bodyParser from 'body-parser';
import mainRouter from './routes';  

declare global {
  namespace Express {
    interface Request {
      user?: User;
      videoId?: number;
      fileId?: string;
      fileValidationError?: string
    }
  }
}


const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploaded_files', express.static('uploaded_files'));

// Use the routers
app.use('/api', mainRouter);



AppDataSource.initialize().then(async () => {

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}).catch(error => console.log(error));
