export const generateDestination = async function (req: Request, file: Express.Multer.File, dir: string, cb: DestinationCallback) {
    try {
        await fs.promises.mkdir(dir, { recursive: true });
        cb(null, dir);
    } catch (err) {
        cb(new Error("Directory could not be created"), 'default_path');
    }
};

export const generateFilename = async function (req: Request, file: Express.Multer.File, dir: string, cb: FileNameCallback) {
    let fileExt = file.originalname.split('.').pop();
    let name: string;
    do {
        name = `${makeid(16)}.${fileExt}`;
    } while (await fs.promises.access(`${dir}${name}`).then(() => true, () => false));
    
    cb(null, name)
};