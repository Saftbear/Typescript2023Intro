export interface IFfmpegWrapper {
    generateThumbnail(inputPath: string, outputPath: string, timemarks: number, filename: string): Promise<void>;
    createPreview(inputPath: string, outputPath: string, fps: number):  Promise<void>;
    createShortVideoClip(inputPath: string, startTime: number, outputPath: string):  Promise<void>;
    mergeShortVideoClips(clips: string[], outputPath: string, tempPath: string):   Promise<void>;
    setDuration(inputPath: string):   Promise<number>;
  }