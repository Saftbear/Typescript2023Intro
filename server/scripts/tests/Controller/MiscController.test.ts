import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import mainRouter from '../../routes';
import { MiscService } from '../../Services/MiscService';
import { VideoResponse } from '../../types/Response';

jest.mock('../../Services/MiscService', () => {
  return {
    __esModule: true,
    MiscService: {
      getVideos: jest.fn(),
      checkThumbnails: jest.fn(),
      uploadThumbnail: jest.fn(),
    },
  };
});

describe('MiscController', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api', mainRouter);
    jest.resetAllMocks();
  });

  it('should return videos if they exist', async () => {
    const mockVideos: VideoResponse[] = [
      {
        id: 1,
        title: 'Video 1',
        path: '/path/to/video1.mp4',
        user: 'test',
        thumbnail: 'thumbnail1.png',
      },
      {
        id: 2,
        title: 'Video 2',
        path: '/path/to/video2.mp4',
        user: 'test1',
        thumbnail: 'thumbnail2.png',
      },

    ];

    (MiscService.getVideos as jest.Mock).mockImplementation(() => Promise.resolve(mockVideos));

    const res = await request(app).get('/api/misc/get-videos');

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(mockVideos);
  });

  it('should return 404 when no videos are found', async () => {
    (MiscService.getVideos as jest.Mock).mockImplementation(() => Promise.resolve([]));
  
    const res = await request(app).get('/api/misc/get-videos');
  
    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual('Videos not found');
  });
  

  it('should return 500 when an error occurs', async () => {
    (MiscService.getVideos as jest.Mock).mockImplementation(() => Promise.reject(new Error('Test error')));
  
    const res = await request(app).get('/api/misc/get-videos');
  
    expect(res.status).toEqual(500);
    expect(res.body.error).toEqual('An error occurred while fetching videos');
  });
  
});
