import bcrypt from 'bcrypt';
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
describe("POST /api/auth/login", () => {


  let app: express.Express;
      
  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    // Use the routers
    app.use('/api', mainRouter);
    jest.resetAllMocks();
  });

  it("should log in a user", async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      password: bcrypt.hashSync('test', 10),
    };

    // Mock findOne to return the mock user
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => mockUser);

    // Prepare the request body
    const loginData = {
      username: mockUser.username,
      password: 'test',  // the plaintext password should match the hashed one stored in the mock user
    };

    // Send the request
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    // Check the response
    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });
  it("should respond with 401 when user does not exist", async () => {
    // Mock findOne to return undefined
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => undefined);
  
    const loginData = {
      username: 'nonexistent',
      password: 'test',
    };
  
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);
  
    expect(res.status).toEqual(401);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual("Invalid Username or Password");
  });
  
  it("should respond with 401 when password does not match", async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      password: bcrypt.hashSync('wrongpassword', 10),
    };
  
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => mockUser);
  
    const loginData = {
      username: mockUser.username,
      password: 'test',
    };
  
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);
  
    expect(res.status).toEqual(401);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual("Invalid Username or Password");
  });

  it("should respond with 400 when username is not provided", async () => {
    const loginData = {
      password: 'test', // Provide only password, no username
    };
  
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);
  
    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual("No username provided");
  });
  
  it("should respond with 400 when password is not provided", async () => {
    const loginData = {
      username: 'test', // Provide only username, no password
    };
  
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);
  
    expect(res.status).toEqual(400);
    expect(res.body.message).toEqual("No password provided");
  });

  
  it("should respond with 500 when there is an error finding the user", async () => {
    // Mock findOne to throw an error
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });
  
    const loginData = {
      username: 'test',
      password: 'test',
    };
  
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);
  
    expect(res.status).toEqual(500);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual("Error logging in");
  });
  


});
