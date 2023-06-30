import { MiscService } from '../../Services/MiscService';
import { AppDataSource } from '../../../database/data-source';
import {Video, User } from '../../../database';
import { VideoResponse } from '../../types/Response';
import { IMiscService } from '../../Interfaces/IMiscService';

jest.mock('../../../database/data-source', () => {
  return {
    __esModule: true,
    AppDataSource: {
      manager: {
        find: jest.fn(),
      },
    },
  };
});

describe('MiscService', () => {
  const miscService: IMiscService = new MiscService();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return videos if they exist', async () => {


    const mockVideos: Video[] = [
        {
          id: 1,
          title: 'Video 1',
          thumbnail: 'thumbnail1.png',
          description: 'test',
          duration: 1,
          playlists : [],
          path: '/path/to/video1.mp4',
          user: {
            id: 1,
            username: 'test',
            password: 'test_password',
            email: 'test@example.com',
            videos: [],
            playlists: [],
          },
        },
        {
          id: 2,
          title: 'Video 2',
          description: 'test',
          duration: 1,
          playlists : [],
          thumbnail: 'thumbnail2.png',
          path: '/path/to/video2.mp4',
          user: {
            id: 2,
            username: 'test2',
            password: 'test_password2',
            email: 'test2@example.com',
            videos: [],
            playlists: [],
          },
        },
      ];
      (AppDataSource.manager.find as jest.Mock).mockImplementation(() => mockVideos);
      const videos: VideoResponse[] = await miscService.getVideos();
    
      expect(videos).toEqual(mockVideos.map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        path: video.path,
        user: video.user.username,
      })));
    });     

  it('should throw an error when no videos are found', async () => {
    (AppDataSource.manager.find as jest.Mock).mockImplementation(() => []);

    await expect(miscService.getVideos()).rejects.toThrow('No videos found');
  });

  it('should throw an error when an error occurs', async () => {
    (AppDataSource.manager.find as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    await expect(miscService.getVideos()).rejects.toThrow('Test error');
  });
});
