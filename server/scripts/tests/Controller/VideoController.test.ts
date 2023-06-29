import { VideoService } from '../../Services/VideoService';
import { User } from "../../../database";
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import mainRouter from '../../routes';
import { Request, Response, NextFunction } from 'express';

const user: User = {
  id: 1, 
  username: "test",
  password: "test_password",
  email: "test@example.com",
  videos: [],
  playlists: []
};


const token: string = "test_token"; 
jest.mock('../../middleware', () => { return { __esModule: true, authMiddleware: (req: Request, res: Response, next: NextFunction) => 
  { if (req.headers['x-user'] !== 'none') 
    { req.user = user; }
   next(); }, }; 
  });

jest.mock('../../Services/VideoService', () => {
  return {
    __esModule: true,
    VideoService: {
      createVideo: jest.fn(),
      getVideoById: jest.fn(),
    },
  };
});
jest.mock('../../../database/data-source', () => {
 
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
describe('POST /api/video/videos', () => {
  let app: express.Express;
  
  beforeEach(() => {
    app = express();


    app.use(bodyParser.json());

    app.use('/api', mainRouter);
    jest.resetAllMocks();
  });

  it('should create a video', async () => {
    const mockVideo = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      filename: 'test.mp4',
      user: { id: 1, username: 'test' },
      playlists: [],
    };

    (VideoService.createVideo as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));

    const res = await request(app)
      .post('/api/video/videos')
      .send(mockVideo) 
      .set({ 'filename': 'test.mp4', 'Authorization': `Bearer ${token}` });

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(mockVideo);
  });

  it('should throw an error if no user is found in the request', async () => {
    const mockVideo = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      filename: 'test.mp4',
      user: { id: 1, username: 'test' },
      playlists: [],
    };
    const res = await request(app)
      .post('/api/video/videos')
      .send(mockVideo)
      .set({'filename': 'test.mp4', 'x-user': 'none'}); // 'x-user' is 'none' so that no user is attached in the authMiddleware

    expect(res.status).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should throw an error if filename is not provided or invalid', async () => {
    const mockVideo = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      filename: 'test.mp4',
      user: { id: 1, username: 'test' },
      playlists: [],
    };
    const res = await request(app)
      .post('/api/video/videos')
      .send(mockVideo)
      .set({'Authorization': `Bearer ${token}`});

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid filename');
  });

  it('should throw an error if there is an error while creating the video', async () => {
    const mockVideo = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      filename: 'test.mp4',
      user: { id: 1, username: 'test' },
      playlists: [],
    };
    const error = new Error('Create video error');
    (VideoService.createVideo as jest.Mock).mockImplementation(() => Promise.reject(error));

    const res = await request(app)
      .post('/api/video/videos')
      .send(mockVideo)
      .set({'filename': 'test.mp4', 'Authorization': `Bearer ${token}`});

    expect(res.status).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Create video error');
  });
});
