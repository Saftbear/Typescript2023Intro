
export interface IAdditional {
    directoryExistsOrCreate(path: string):  boolean;
    create_thumbnail(path?: string, filename?: string):   Promise<void>;
    create_preview(path?: string, filename?: string):  Promise<void>;
    createShortVideo(path?: string, filename?: string):  Promise<void>;
    setDuration (path: string): Promise<void>;
    getDuration(): number;
  }