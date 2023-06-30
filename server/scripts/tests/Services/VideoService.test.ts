import { VideoService } from '../../Services/VideoService';
import { AppDataSource } from '../../../database/data-source';
import { CreateVideoBody } from '../../Interfaces/Requests';
import { Video } from '../../../database';
import { IVideoService } from '../../Interfaces/IVideoService';
import { User } from '../../../database';
import { Playlist } from '../../../database';
import mock from 'mock-fs';
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
describe('VideoService', () => {
  const videoService: IVideoService = new VideoService();

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should create a video', async () => {
    const mockUser = {
      id: 1,
      password: 'test_password',
      email: 'test-email',
      username: 'test',
      videos: [],
    playlists: []
    };

    const filename = 'test.mp4';

    const body: CreateVideoBody = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      playlist: []
    }
    
    const mockVideo = {...body, filename, user: mockUser};

    (AppDataSource.manager.save as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));
    
    const video: Video = await videoService.createVideo(mockUser, filename, body);
    expect(video).toEqual(mockVideo);
    expect(AppDataSource.manager.save).toHaveBeenCalledWith(mockVideo);
  });

  it('should throw an error if filename is not valid', async () => {
    const mockUser: User = {
        id: 1,
        password: 'test_password',
        email: 'test-email',
        username: 'test',
        videos: [],
      playlists: []
      };

    const filename: string = '';
    const body: CreateVideoBody = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      playlist: []
    }

    await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid filename');
  });

  it('should throw an error if user is not valid', async () => {
    const mockUser: User = {
        id: NaN,
        password: 'undefined',
        email: 'undefined',
        username: 'undefined',
        videos: [],
      playlists: []
      };
    const filename:string = 'test.mp4';
    const body: CreateVideoBody = {
        title: 'Test Video',
        description: 'This is a test video',
        thumbnail: 'test.png',
        playlist: []
      }
    await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid user');
  });


  it('should get video by id', async () => {
    const mockVideo = {
      id: 1,
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      filename: 'test.mp4',
      user: { id: 1 },
    };

    (AppDataSource.manager.save as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));

    const video: Video = await videoService.getVideoById(1);
    expect(video).toEqual(mockVideo);
    expect(AppDataSource.manager.findOne).toHaveBeenCalledWith(Video, { where: { id: 1 }, relations: ["user", "playlists"] });
    });
    it('should throw an error if id is NaN', async () => {
      await expect(videoService.getVideoById(NaN)).rejects.toThrow('Invalid id');
    });
    it('should throw an error if no video found', async () => {
        const mockUser: User = {
            id: 1,
            password: 'undefined',
            email: 'undefined',
            username: 'undefined',
            videos: [],
          playlists: []
          };

          const filename:string = 'test.mp4';

          const body: CreateVideoBody = {
            title: 'Test Video',
            description: 'This is a test video',
            thumbnail: 'test.png',
            playlist: []
          }
          
          const mockVideo = {...body, filename, user: mockUser};
      
        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.reject(mockVideo));
        await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Database error finding video');
    });

    it('should throw an error if no video found', async () => {
        const mockUser: User = {
            id: 1,
            password: 'undefined',
            email: 'undefined',
            username: 'undefined',
            videos: [],
          playlists: []
          };

        const filename: string = 'test.mp4';

        const body: CreateVideoBody = {
            title: 'Test Video',
            description: 'This is a test video',
            thumbnail: 'test.png',
            playlist: []
          }
          
        const mockVideo = {...body, filename, user: mockUser};
        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));
        (AppDataSource.manager.save as jest.Mock).mockImplementation(() => Promise.reject(mockVideo));

        await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Database error saving video');
    });
    it('should throw an error if findOne returns undefined', async () => {
      const mockUser: User = {
        id: 1,
        password: 'undefined',
        email: 'undefined',
        username: 'undefined',
        videos: [],
      playlists: []
      };
      const filename = 'test.mp4';
      const body: CreateVideoBody = {
        title: 'Test Video',
        description: 'This is a test video',
        thumbnail: 'test.png',
        playlist: []
      };
      
  
      (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.resolve(undefined));
  
      await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Video not found');
    });
    it('should throw an error if title is not a valid string', async () => {
      const mockUser: User = {
        id: 1,
        password: 'undefined',
        email: 'undefined',
        username: 'undefined',
        videos: [],
      playlists: []
      };

    const filename: string = 'test.mp4';

      const body: CreateVideoBody = {
        title: '',
        description: 'This is a test video',
        thumbnail: 'test.png',
        playlist: []
      }
    
      await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid title');
    });
    
    it('should throw an error if description is not a valid string', async () => {
      const mockUser: User = {
        id: 1,
        password: 'undefined',
        email: 'undefined',
        username: 'undefined',
        videos: [],
        playlists: []
      };

    const filename: string = 'test.mp4';

    const body: CreateVideoBody = {
        title: 'Test Video',
        description: '',
        thumbnail: 'test.png',
        playlist: []
      }
    
      await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid description');
    });
    
    it('should throw an error if thumbnail is not a valid string', async () => {
      const mockUser: User = {
        id: 1,
        password: 'undefined',
        email: 'undefined',
        username: 'undefined',
        videos: [],
      playlists: []
      };

    const filename: string = 'test.mp4';

    const body: CreateVideoBody = {
        title: 'Test Video',
        description: 'This is a test video',
        thumbnail: '',
        playlist: []
      }
    
      await expect(videoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid thumbnail');
    });
  

});
