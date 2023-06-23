import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import mainRouter from '../routes/';
import { AppDataSource } from '../../database/data-source';

jest.mock('../../database/data-source', () => {
  return {
    __esModule: true,
    AppDataSource: {
      manager: {
        find: jest.fn(),
      },
    },
  };
});

describe("GET /api/videos", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api', mainRouter);
    jest.resetAllMocks();
  });

  it("should return videos if they exist", async () => {
    const mockVideos = [
      {
        id: 1,
        title: 'Video 1',
        thumbnail: 'thumbnail1.png',
        path: '/path/to/video1.mp4',
        user: {
          username: 'user1',
        },
      },
      {
        id: 2,
        title: 'Video 2',
        thumbnail: 'thumbnail2.png',
        path: '/path/to/video2.mp4',
        user: {
          username: 'user2',
        },
      },
    ];

    // Mock find to return the mock videos
    (AppDataSource.manager.find as jest.Mock).mockImplementation(() => mockVideos);

    const res = await request(app).get('/api/misc/get-videos');

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(mockVideos.map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      path: video.path,
      user: video.user.username,
    })));
  });

  it("should return 404 when no videos are found", async () => {
    // Mock find to return an empty array
    (AppDataSource.manager.find as jest.Mock).mockImplementation(() => []);

    const res = await request(app).get('/api/misc/get-videos');

    expect(res.status).toEqual(404);
    expect(res.body.error).toEqual("No videos found");
  });

  it("should return 500 when an error occurs", async () => {
    // Mock find to throw an error
    (AppDataSource.manager.find as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });

    const res = await request(app).get('/api/misc/get-videos');

    expect(res.status).toEqual(500);
    expect(res.body.error).toEqual("An error occurred while fetching videos");
  });
});
