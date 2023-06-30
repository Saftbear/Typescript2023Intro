import { Request } from 'express';
import multer, { FileFilterCallback } from "multer";
import  fs from 'fs';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;


export const generateDestination = async function (req: Request, file: Express.Multer.File, cb: DestinationCallback): Promise<void> {
    const id: string = req.headers.filename as string;

    const dir: string = `uploaded_files/Thumbnails/${id}/`;

    try {
        await fs.promises.mkdir(dir, { recursive: true });
        cb(null, dir);
    } catch (err) {
        cb(new Error("fileId is not set on the request"), 'default_path');
    }
};

export const generateFilename = async function (req: Request, file: Express.Multer.File, cb: FileNameCallback): Promise<void> {
    const fileExt: string | undefined = file.originalname.split('.').pop();
    const id: string = req.headers.filename as string;

    let name: string;
    do {
        name = `${makeid(16)}.${fileExt}`;
    } while (await fs.promises.access(`uploaded_files/Thumbnails/${id}/${name}`).then(() => true, () => false));
    
    cb(null, name)
};
export const storage = multer.diskStorage({
    destination: generateDestination,
    filename: generateFilename
});

const fileFilter = (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/gif'
    ) {
        callback(null, true);
    } else {
        request.fileValidationError = 'Invalid file type. Only images are allowed.';
        callback(null, false);
    }
}


function makeid(length: number): string {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    let counter: number = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export const upload_thumbnails = multer({ storage: storage, fileFilter: fileFilter });
