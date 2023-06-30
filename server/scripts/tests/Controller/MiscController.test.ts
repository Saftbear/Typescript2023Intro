import { Request, Response } from "express";
import { MiscController } from "../../Controller/MiscController";
import { IMiscService } from "../../Interfaces/IMiscService";
import { VideoResponse } from '../../types/Response';

describe("MiscController", () => {
  let miscService: IMiscService;
  let miscController: MiscController;
  let req: Request;
  let res: Response;
  const next = jest.fn();
  beforeEach(() => {
    miscService = {
      getVideos: jest.fn(),
      checkThumbnails: jest.fn(),
      uploadThumbnail: jest.fn(),
    };
    miscController = new MiscController(miscService);
    req = {} as Request;
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
  });

  describe("getVideos", () => {
    it("should return videos if they exist", async () => {
      const mockVideos: VideoResponse[] = [
        {
          id: 1,
          title: "Video 1",
          path: "/path/to/video1.mp4",
          user: "test",
          thumbnail: "thumbnail1.png",
        },
        {
          id: 2,
          title: "Video 2",
          path: "/path/to/video2.mp4",
          user: "test1",
          thumbnail: "thumbnail2.png",
        },
      ];
      miscService.getVideos = jest.fn().mockResolvedValue(mockVideos);
      res.json = jest.fn();
      await miscController.getVideos(req, res, next);

      expect(miscService.getVideos).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVideos);
    });

    it("should return 404 when no videos are found", async () => {
      miscService.getVideos = jest.fn().mockResolvedValue([]);
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn();
      await miscController.getVideos(req, res, next);

      expect(miscService.getVideos).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Videos not found",
      });
    });

    it("should return 500 when an error occurs", async () => {
      miscService.getVideos = jest.fn().mockRejectedValue(new Error("Test error"));
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn();
      await miscController.getVideos(req, res, next);

      expect(miscService.getVideos).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "An error occurred while fetching videos",
      });
    });
  });
});
