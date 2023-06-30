
import { User } from "../../database";
import RegisterRequestBody from "./requestBodies";

export interface IAuthService {
    registerUser(body: RegisterRequestBody): Promise<User>;
    loginUser(username: string, password: string): Promise<any>;
    getMe(token: string): Promise<User | null>;
}