import { Request, Response } from "express";
import { VideoController } from "../../Controller/VideoController";
import { IVideoService } from "../../Interfaces/IVideoService";
import { Video } from "../../../database";

describe("VideoController", () => {
  let videoService: IVideoService;
  let videoController: VideoController;
  let req: Request;
  let res: Response;
  let next: jest.Mock;
  
  beforeEach(() => {
    videoService = {
      createVideo: jest.fn(),
      getVideoById: jest.fn(),
      getVideoByPath: jest.fn(),
      deleteVideo: jest.fn(),
      submitForm: jest.fn(),
    };
    videoController = new VideoController(videoService);
    req = { headers: { filename: "test.mp4" } } as unknown as Request;
    res = { json: jest.fn(), status: jest.fn().mockReturnThis()} as unknown as Response;
  });

  describe("createVideo", () => {
    it("should create a video and return the created video", async () => {
      const mockVideo: Video = {
        id: 1,
        title: "Test Video",
        description: "This is a test video",
        thumbnail: "test.png",
        duration: 100,
        path: "test.mp4",
        user: {
          id: 1,
          password: "testpass",
          username: "testuser",
          email: "test@example.com",
          videos: [],
          playlists: [],
        },
        playlists: [],
      };
      videoService.createVideo = jest.fn().mockResolvedValue(mockVideo);
      req.user = mockVideo.user;
      await videoController.createVideo(req, res, next);

      expect(videoService.createVideo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVideo);
    });

    it("should respond with an error if no user is found in the request", async () => {


      await videoController.createVideo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should respond with an error if the filename is missing or invalid", async () => {
      const mockVideo: Video = {
        id: 1,
        title: "Test Video",
        description: "This is a test video",
        thumbnail: "test.png",
        duration: 100,
        path: '',
        user: {
          id: 1,
          password: "testpass",
          username: "testuser",
          email: "test@example.com",
          videos: [],
          playlists: [],
        },
        playlists: [],
      };
      videoService.createVideo = jest.fn().mockResolvedValue(mockVideo);

      req.user = mockVideo.user;
      delete req.headers.filename;

      await videoController.createVideo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid filename" });
    });

    it("should respond with an error if an error occurs during video creation", async () => {
      const mockVideo: Video = {
        id: 1,
        title: "Test Video",
        description: "This is a test video",
        thumbnail: "test.png",
        duration: 100,
        path: "test.mp4",
        user: {
          id: 1,
          password: "testpass",
          username: "testuser",
          email: "test@example.com",
          videos: [],
          playlists: [],
        },
        playlists: [],
      };
      const error = new Error("Create video error");
      videoService.createVideo = jest.fn().mockRejectedValue(error);
      req.user = mockVideo.user;
      req.body = mockVideo;

      await videoController.createVideo(req, res, next);

      expect(videoService.createVideo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Create video error" });
    });
  });
});
