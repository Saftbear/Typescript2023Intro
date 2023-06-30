  import { NextFunction, Request, Response } from "express";
  import { AuthController } from "../../Controller/AuthController";
  import { IAuthService } from "../../Interfaces/IAuthService";
  import { LoginResponse } from '../../types/Response';

  describe("AuthController", () => {
    let authService: IAuthService;
    let authController: AuthController;
    let req: Request;
    let res: Response;
    const next: NextFunction = jest.fn();

    beforeEach(() => {
      authService = {
        loginUser: jest.fn(),
        registerUser: jest.fn(),
        getMe: jest.fn(),
      };
      authController = new AuthController(authService);
      req = { body: { username: "testuser", password: "testpass" } } as Request;
      res = { json: jest.fn(), status: jest.fn() } as unknown as Response;
    });

    describe("login", () => {
      it("should log in a user and return the result", async () => {
        const loginResponse: LoginResponse = {
          token: "token",
          user: {
            id: 1,
            password: "testpass",
            username: "testuser",
            email: "test@example.com",
            videos: [],
            playlists: [],
          },
        };
        authService.loginUser = jest.fn().mockResolvedValue(loginResponse);
        res.json = jest.fn();
        const next = jest.fn();
        await authController.login(req, res, next);

        expect(authService.loginUser).toHaveBeenCalledWith("testuser", "testpass");
        expect(res.json).toHaveBeenCalledWith({
          message: "User logged in successfully",
          token: "token",
          user: {
            id: 1,
            username: "testuser",
            password: "testpass",
            email: "test@example.com",
            videos: [],
            playlists: [],
          },
          success: true,
        });
      });

      it("should respond with 400 when username or password is missing", async () => {
        authService.loginUser = jest.fn().mockImplementation(() => {
          throw new Error("Missing parameters");
        });
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "Username and password are required",
          success: false,
        });
      });

      it("should respond with 401 when the username or password is invalid", async () => {
        authService.loginUser = jest.fn().mockImplementation(() => {
          throw new Error("Invalid Username or Password");
        });
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: "Invalid Username or Password",
          success: false,
        });
      });

      it("should respond with 500 when an error occurs", async () => {
        authService.loginUser = jest.fn().mockImplementation(() => {
          throw new Error("Test Error");
        });
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server Error",
          success: false,
        });
      });
    });
  });
