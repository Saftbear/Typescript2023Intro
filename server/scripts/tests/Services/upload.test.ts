import { fileFilter, generateDestination, generateFilename  } from '../../Services/videoUpload';
import { Request } from 'express';
import mock from 'mock-fs';
import fs from 'fs';

describe('Multer Config', () => {
  describe('storage', () => {
    it('generates a unique filename', async () => {
      const filenameCb: jest.Mock = jest.fn();
      
      mock({
        'uploaded_files/uploads/': {
          'existingfile.txt': 'file contents here',
        }
      });

      await generateFilename({} as Request, { originalname: 'test.txt' } as Express.Multer.File, filenameCb);

            
      expect(filenameCb).toHaveBeenCalledWith(null, expect.not.stringContaining('existingfile'));
      
      mock.restore();
    });

    it('uses the correct directory', async () => {
      const dirCb: jest.Mock = jest.fn();
      
      mock({
        'uploaded_files/uploads/': {}
      });

      await generateDestination({} as Request, {} as Express.Multer.File, dirCb);
      expect(dirCb).toHaveBeenCalledWith(null, 'uploaded_files/uploads/');
      
      mock.restore();
    });
  });

  describe('fileFilter', () => {
    it('accepts correct file types', () => {
      const cb:  jest.Mock = jest.fn();
      fileFilter(
        {} as Request,
        { mimetype: 'video/mp4' } as Express.Multer.File,
        cb
      );
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('rejects incorrect file types', () => {
      const cb: jest.Mock = jest.fn();
      fileFilter(
        {} as Request,
        { mimetype: 'application/pdf' } as Express.Multer.File,
        cb
      );
      expect(cb).toHaveBeenCalledWith(null, false);
    });
  });

  it('throws error if directory cannot be created', async () => {
    const dirCb: jest.Mock = jest.fn();
    const originalMkdir = fs.promises.mkdir;
    fs.promises.mkdir = jest.fn(() => { throw new Error('Cannot create directory') });
    await generateDestination({} as Request, {} as Express.Multer.File, dirCb);
    expect(dirCb).toHaveBeenCalledWith(expect.any(Error), 'default_path');
    fs.promises.mkdir = originalMkdir;
  });
  
  it('throws error if filename cannot be generated', async () => {
    const filenameCb = jest.fn(() => { throw new Error('Error generating filename'); });
    await expect(generateFilename({} as Request, { originalname: 'test.txt' } as Express.Multer.File, filenameCb)).rejects.toThrow('Error generating filename');
  });
  
  it('handles null mimetype', () => {
    const cb = jest.fn();
    fileFilter(
      {} as Request,
      { mimetype: null } as unknown as Express.Multer.File, 
      cb
    );
    expect(cb).toHaveBeenCalledWith(null, false);
  });
  

});
