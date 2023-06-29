import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../../database";
import { AppDataSource } from "../../database/data-source";
import RegisterRequestBody from "../types/requestBodies";
import { JWTPayload } from "../types/Requests";

class AuthService {

  static async registerUser(body: RegisterRequestBody): Promise<User> {
    const { username, password, email } = body;
    if(!username || !password || !email){
      throw new Error("Missing parameters");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    user.email = email;
    await AppDataSource.manager.save(user);
    return user;
  }

  static async loginUser(username: string, password: string): Promise<any> {
    if (!username || !password) {
      throw new Error('Missing parameters');
    }
    const secretKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.

    const user = await AppDataSource.manager.findOne(User, { where: { username } });
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id }, secretKey);
      return { token: token, user: user };
    }
    throw new Error('Invalid Username or Password');
  }

  static async getMe(token: string): Promise<User | null> {
    if (!token) {
      throw new Error("No token provided");
    }
    const secretKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.
    const decoded = jwt.verify(token, secretKey) as JWTPayload;
    if (typeof decoded === "string"){
      return null;
    }
    const userId = decoded.id;
    const user = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;
    return user;
  }
}

export default AuthService;
