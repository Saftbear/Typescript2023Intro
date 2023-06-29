import { VideoService } from '../../Services/VideoService';
import { AppDataSource } from '../../../database/data-source';
import { CreateVideoBody } from '../../types/Requests';
import { Video } from '../../../database';
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
  afterEach(() => {
    jest.resetAllMocks();
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
    

    const video = await VideoService.createVideo(mockUser, filename, body);
    expect(video).toEqual(mockVideo);
    expect(AppDataSource.manager.save).toHaveBeenCalledWith(mockVideo);
  });

  it('should throw an error if filename is not valid', async () => {
    const mockUser = {
        id: 1,
        password: 'test_password',
        email: 'test-email',
        username: 'test',
        videos: [],
      playlists: []
      };

    const filename = '';
    const body: CreateVideoBody = {
      title: 'Test Video',
      description: 'This is a test video',
      thumbnail: 'test.png',
      playlist: []
    }

    await expect(VideoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid filename');
  });

  it('should throw an error if user is not valid', async () => {
    const mockUser = {
        id: NaN,
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
      }

    await expect(VideoService.createVideo(mockUser, filename, body)).rejects.toThrow('Invalid user');
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
    
    const video = await VideoService.getVideoById(1);
    expect(video).toEqual(mockVideo);
    expect(AppDataSource.manager.findOne).toHaveBeenCalledWith(Video, { where: { id: 1 }, relations: ["user", "playlists"] });
    });
    it('should throw an error if id is NaN', async () => {
        await expect(VideoService.getVideoById(NaN)).rejects.toThrow('Invalid id');
    });
    it('should throw an error if no video found', async () => {
        const mockUser = {
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
          }
          
          const mockVideo = {...body, filename, user: mockUser};
      
        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.reject(mockVideo));

        await expect(VideoService.createVideo(mockUser, filename, body)).rejects.toThrow('Database error finding video');
    });

    it('should throw an error if no video found', async () => {
        const mockUser = {
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
          }
          
        const mockVideo = {...body, filename, user: mockUser};
        (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => Promise.resolve(mockVideo));
        (AppDataSource.manager.save as jest.Mock).mockImplementation(() => Promise.reject(mockVideo));

        await expect(VideoService.createVideo(mockUser, filename, body)).rejects.toThrow('Database error saving video');
    });

});
