import { Request, Response, RequestHandler } from "express"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RegisterRequestBody from "../types/requestBodies";
import { AppDataSource } from "../../database/data-source";
import { User } from "../../database";
import { JWTPayload } from "../types/Requests";


export const register: RequestHandler = async (req: Request, res: Response) => {

  try {
    const { username, password, email } = req.body as RegisterRequestBody;
    if(!username){
      return res.status(400).json({ message: "No username provided" });

    }
    if (!password) {
      return res.status(400).json({ message: "No password provided" });
    }
  
    if (!email) {
      return res.status(400).json({ message: "No email provided" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();

    user.username = username;
    user.password = hashedPassword;
    user.email = email;

    await AppDataSource.manager.save(user);
    return res.status(200).json({ message: "User registered successfully", id: user.id, success: true });
  } catch (error) {
    const err = error as any;
    
    if (err.code === 'SQLITE_CONSTRAINT') {
        // The constraint that failed is mentioned in the error message after "user."
        let failedConstraint = err.message.split('user.')[1];
        console.log(failedConstraint)
        if (failedConstraint == "username")
        {
          return res.status(400).json({ message: "Username already exists", success: false });
        }
        else{
          return res.status(500).json({ message: "Error registering user", success: false });
        }
    }
  }

};

export const login: RequestHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    if(!username){
      return res.status(400).json({ message: "No username provided" });

    }
    if (!password) {
      return res.status(400).json({ message: "No password provided" });
    }

    const user = await AppDataSource.manager.findOne(User, { where: { username } }) as User;
    if (user && bcrypt.compareSync(password, user.password)) {
      const secretKey:string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.

      if (secretKey == undefined){
        return
      }
      const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '5h' });
      return res.json({ message: "User logged in successfully", token:token, user: user, success: true  });
    } else {
      return res.status(401).json({ message: "Invalid Username or Password", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", success: false });
  }
};

export const getMe: RequestHandler = async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader){
    return res.status(403).json({ message: 'No authHeader provided' });
  }
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const secretKey:string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhc2QiLCJpYXQiOjE2ODU3ODIwMzEsImV4cCI6MTY4NTc4NTYzMX0.nRj5bePMkZOdsos4YMPfJ0J_GWiRNtH5QE3CVcG9LMY"; // should not be in here.
    if (secretKey == undefined){
      return
    }

    const decoded = jwt.verify(token, secretKey) as JWTPayload;

    if (typeof decoded === "string"){
      return
    }
    const userId = decoded.id;
    const user = await AppDataSource.manager.findOne(User, { where: { id: userId } }) as User;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};
