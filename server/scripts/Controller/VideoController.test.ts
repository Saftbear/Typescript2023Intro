
import { AppDataSource } from "../../database/data-source"


import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
// mock AppDataSource 

import mainRouter from '../routes/'; // adjust path
import bodyParser from 'body-parser';

import jwt from 'jsonwebtoken';

const secretKey:string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.

let token: string;
let user;
beforeEach(async () => {
  user = {id: 1, username: "test"};
  await AppDataSource.manager.save(user);

  token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
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
    
    // Mock Models
    jest.mock('../../database', () => ({  // adjust path
      Video: jest.fn().mockImplementation(() => ({
        playlists: []
      })),

    }));


    describe("POST video/videos", () => {
      let app: express.Express;
      
      beforeEach(() => {
        app = express();


        app.use(bodyParser.json());
        // Use the routers
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

 

        let send_data = {
          title: "Test Video", 
          description: "This is a test video", 
          thumbnail: "test.png", 
          isPrivate: false, 
          user: { id: 1, username: 'test' }, 
          playlist: []}

        const res = await request(app)
          .post('/api/video/videos')
          .send(send_data) 
          .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`})

        console.log(res.text)
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("{\"message\":\"There were no errors found.\"}" );
      });
    });