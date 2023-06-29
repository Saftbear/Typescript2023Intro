import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../database/data-source';
import AuthService from "../../Services/AuthService";

const mockUser = {
  id: 1,
  username: 'test',
  password: bcrypt.hashSync('test', 10),
  email: "test@example.com",
};

jest.mock('../../../database/data-source', () => {
  return {
    __esModule: true,
    AppDataSource: {
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    },
  };
});

describe('AuthService', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should login a user', async () => {
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => mockUser);
    const result = await AuthService.loginUser(mockUser.username, 'test');

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
  });

  it('should throw an error when the user does not exist', async () => {
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => undefined);
    await expect(AuthService.loginUser('nonexistent', 'test')).rejects.toThrow("Invalid Username or Password");
  });

  it('should throw an error when the password does not match', async () => {
    (AppDataSource.manager.findOne as jest.Mock).mockImplementation(() => mockUser);
    await expect(AuthService.loginUser(mockUser.username, 'wrongpassword')).rejects.toThrow("Invalid Username or Password");
  });
  it('should throw an error when the username is not provided', async () => {
    await expect(AuthService.loginUser('', 'test')).rejects.toThrow("Missing parameters");
  });
  
  it('should throw an error when the password is not provided', async () => {
    await expect(AuthService.loginUser('test', '')).rejects.toThrow("Missing parameters");
  });
  
});
