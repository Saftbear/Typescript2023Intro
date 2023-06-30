import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../../database";
import { AppDataSource } from "../../database/data-source";
import RegisterRequestBody from "../Interfaces/requestBodies";
import { IAuthService } from '../Interfaces/IAuthService';
import { LoginResponse } from '../types/Response';
import { JwtPayload } from 'jsonwebtoken';

class AuthService implements IAuthService {

  public async registerUser(body: RegisterRequestBody): Promise<User> {
    const { username, password, email } = body;
    if(!username || !password || !email){
      throw new Error("Missing parameters");
    }
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: User = new User();
    user.username = username;
    user.password = hashedPassword;
    user.email = email;
    try{
        await AppDataSource.manager.save(user);
    }catch (err) {
        throw new Error('Database error - user already exists');
    }
    return user;
  }

  public async loginUser(username: string, password: string): Promise<LoginResponse> {
    if (!username || !password) {
      throw new Error('Missing parameters');
    }
    const secretKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.

    const user: User | null = await AppDataSource.manager.findOne(User, { where: { username } });
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token: string = jwt.sign({ id: user.id }, secretKey);
      return { token: token, user: user };
    }
    throw new Error('Invalid Username or Password');
  }

  public async getMe(token: string): Promise<User | null> {
    if (!token) {
      throw new Error("No token provided");
    }
    const secretKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.
    const decoded: JwtPayload = jwt.verify(token, secretKey) as JwtPayload;
    if (typeof decoded === "string"){
      return null;
    }
    const userId: number = decoded.id;
    let user: User 
    try{
        user = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;

    }catch(err){
        throw new Error("User not found");
    }

    return user;
  }
}

export default AuthService;
