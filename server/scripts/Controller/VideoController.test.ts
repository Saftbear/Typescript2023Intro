
import { AppDataSource } from "../../database/data-source"
import { User } from "../../database";
import { authMiddleware } from "../middleware";
import { jest } from '@jest/globals';
import request from 'supertest';
import express, {Request, Response, NextFunction } from 'express';

import mainRouter from '../routes/'; 
import bodyParser from 'body-parser';

import jwt from 'jsonwebtoken';
const secretKey:string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.

const user: User = {
  id: 1, 
  username: "test",
  password: "test_password",
  email: "test@example.com",
  videos: [],
  playlists: []
};

let token: string;
jest.mock('../middleware', () => {
  return {
    __esModule: true, 
    authMiddleware: (req: Request, res: Response, next: NextFunction) => {
      if (req.headers['x-user'] !== 'none') {
        req.user = user;  
      } 
      next();
    },
  };
});

jest.mock('../../database/data-source', () => {
 
    return {
      __esModule: true,
      AppDataSource: {
        manager: {
          findOne: jest.fn(),
          find: jest.fn(),
          save: jest.fn(),
          createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockImplementation(() => ({
              getMany: jest.fn().mockReturnValue([])
            })),
          })),
        },
      },
    };
  });
    
    jest.mock('../../database', () => ({  
      Video: jest.fn().mockImplementation(() => ({
        playlists: []
      })),
    }));

    describe("POST video/videos", () => {
      let app: express.Express;
      
      beforeEach(async () => {
        app = express();
      
        await AppDataSource.manager.save(user);
        
        token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
      
        app.use(bodyParser.json());
        // Use the routers
        app.use(authMiddleware);

        app.use('/api', mainRouter);
        jest.resetAllMocks();
      });
      
   
      
      it("should create a video", async () => {
        const mockVideo = {
          title: 'Test Video',
          description: 'This is a test video',
          thumbnail: 'test.png',
          user: { id: 1, username: 'test' },
          playlists: [],
        };


        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => mockVideo);
        (AppDataSource.manager.save as jest.Mock).mockImplementation(() => mockVideo);


        const res = await request(app)
          .post('/api/video/videos')
          .send(mockVideo) 
          .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`})

        console.log(res.text)
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("{\"message\":\"There were no errors found.\"}" );
      });
      it("should respond with 401 when user is not provided", async () => {
        const send_data = {
          title: "Test Video", 
          description: "This is a test video", 
          thumbnail: "test.png", 
          playlist: []
        }

        console.log(token)
        const res = await request(app)
          .post('/api/video/videos')
          .send(send_data) 
          .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`, 'x-user': 'none' // This means no user will be attached
        })

        expect(res.status).toEqual(401);
        expect(res.body.error).toEqual('Unauthorized');
      });
      
      it("should respond with 400 when filename is not provided", async () => {
        const send_data = {
          title: "Test Video", 
          description: "This is a test video", 
          thumbnail: "test.png", 
          user: {id: 1, username: "test"},
          playlist: []
        };
      
        const res = await request(app)
          .post('/api/video/videos')
          .send(send_data)
          .set({'Authorization': `Bearer ${token}`})

        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual("No filename provided");
      });

      it("should respond with 404 when video is not found", async () => {
        const send_data = {
          title: "Test Video", 
          description: "This is a test video", 
          thumbnail: "test.png", 
          user: {id: 1, username: "test"},
          playlist: []
        };
    
        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => undefined);
        
        const res = await request(app)
          .post('/api/video/videos')
          .send(send_data)
          .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`})
      
        console.log(res.body)
        expect(res.status).toEqual(404);
        expect(res.body.error).toEqual("Video not found");
      });

      it("should respond with 500 when an error occurs", async () => {
        const send_data = {
          title: "Test Video", 
          description: "This is a test video", 
          thumbnail: "test.png", 
          user: {id: 1, username: "test"},
          playlist: []
        };
      
        // Mock an error
        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => {
          throw new Error('Test error');
        });
      
        const res = await request(app)
          .post('/api/video/videos')
          .send(send_data) 
          .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`})
      
        console.log(res.body)
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual("An error occurred while creating the video");
      });
    it("should respond with 400 when title, description or thumbnail is not provided", async () => {
        // not providing the 'thumbnail' field in the send_data object
        const send_data = {
          title: "Test Video", 
          description: "This is a test video", 
          user: {id: 1, username: "test"},
          playlist: []
        };
        
        const res = await request(app)
          .post('/api/video/videos')
          .send(send_data)
          .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`})
      
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual("Error when getting details.");
      });
      
    });