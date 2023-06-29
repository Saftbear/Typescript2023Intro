import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import mainRouter from '../../routes/';
import { Request, Response, NextFunction } from 'express';
import AuthService from '../../Services/AuthService';

jest.mock('../../Services/AuthService');

const user = {
  id: 1, 
  username: "test",
  password: "test_password",
  email: "test@example.com",
  videos: [],
  playlists: []
};

jest.mock('../../middleware', () => { 
  return { 
    __esModule: true, 
    authMiddleware: (req: Request, res: Response, next: NextFunction) => { 
      if (req.headers['x-user'] !== 'none') { 
        req.user = user; 
      } 
      next(); 
    }, 
  }; 
});

describe("POST /api/auth/login", () => {
  let app: express.Express;
      
  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api', mainRouter);
    jest.resetAllMocks();
  });

  it("should log in a user", async () => {
    (AuthService.loginUser as jest.Mock).mockImplementation(() => ({
      token: "token",
      user: user,
    }));

    const loginData = {
      username: user.username,
      password: 'test',  
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  it("should respond with 400 when user Parameters are missing", async () => {
    (AuthService.loginUser as jest.Mock).mockImplementation(() => {
      throw new Error("Missing parameters");
    });

    const res = await request(app)
      .post('/api/auth/login')
  
    expect(res.status).toEqual(400);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual("Username and password are required");
  });
  it("should respond with 401 when user does not exist", async () => {
    (AuthService.loginUser as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid Username or Password");
    });

  
    const res = await request(app)
      .post('/api/auth/login')
  
    expect(res.status).toEqual(401);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual("Invalid Username or Password");
  });

  it("should respond with 500 when user does not exist", async () => {
    (AuthService.loginUser as jest.Mock).mockImplementation(() => {
      throw new Error("Test Error");
    });

  
    const res = await request(app)
      .post('/api/auth/login')
  
    expect(res.status).toEqual(500);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual("Server Error");
  });


});
