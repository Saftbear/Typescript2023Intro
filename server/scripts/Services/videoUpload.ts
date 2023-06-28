import { Request } from 'express'
import multer from "multer";
import { FileFilterCallback } from "multer"
import * as fs from 'fs';

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void


export const generateDestination = async function (req: Request, file: Express.Multer.File, cb: DestinationCallback) {
    const dir = 'uploaded_files/uploads/';
    try {
        await fs.promises.mkdir(dir, { recursive: true });
        cb(null, dir);
    } catch (err) {
        cb(new Error("fileId is not set on the request"), 'default_path');
    }
};

export const generateFilename = async function (req: Request, file: Express.Multer.File, cb: FileNameCallback) {
    const fileExt = file.originalname.split('.').pop();
    let name: string;
    do {
        name = `${makeid(16)}.${fileExt}`;
    } while (await fs.promises.access(`uploaded_files/uploads/${name}`).then(() => true, () => false));
    
    cb(null, name)
};

export const storage = multer.diskStorage({
    destination: generateDestination,
    filename: generateFilename
});


export const fileFilter = (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if (
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/mkv' ||
        file.mimetype === 'video/avi' ||
        file.mimetype === 'video/mov' ||
        file.mimetype === 'video/wmx' ||
        file.mimetype === 'video/flv' 
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

function makeid(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


export const upload = multer({ storage: storage, fileFilter: fileFilter }) //async?? This works really slow.
