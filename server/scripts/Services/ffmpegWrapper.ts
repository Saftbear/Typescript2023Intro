
import ffmpeg from "fluent-ffmpeg";

export interface IFfmpegWrapper {
  generateThumbnail: (inputPath: string, outputPath: string, timemarks: number, filename: string) => Promise<void>;
  createPreview: (inputPath: string, outputPath: string, fps: number) => Promise<void>;
  createShortVideoClip: (inputPath: string, startTime: number, outputPath: string) => Promise<void>;
  mergeShortVideoClips: (clips: string[], outputPath: string, tempPath: string) => Promise<void>;
  setDuration: (inputPath: string) => Promise<number>;
}

export class FfmpegWrapper implements IFfmpegWrapper{
  public generateThumbnail(inputPath: string, outputPath: string, timemarks: number , filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .takeScreenshots({
          count: 1,
          timemarks: [timemarks],
          filename: filename
        }, outputPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.log(err)
          reject(err);
        });
    });
  }
  public createPreview(inputPath: string, outputPath: string, fps: number): Promise<void> {

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
          .output(`${outputPath}/preview-0%d.jpg`)
          .outputOptions(`-vf fps=${fps},scale=400:400`)
          .on('end', () => {
              resolve();
          })
          .on('error', (err) => {
              console.error(err);
              reject(err);
          }).run();
  });
  }


   public createShortVideoClip(inputPath: string, startTime: number, outputPath: string): Promise<void> {

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime(startTime)
                .setDuration(1)
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .withNoAudio()
                .run();
        });
    }
    public mergeShortVideoClips(clips: string[], outputPath: string, tempPath: string): Promise<void> {
      
      return new Promise((resolve, reject) => {
            let ffmpeg_merge = ffmpeg();
            clips.forEach((clip) => {
                ffmpeg_merge = ffmpeg_merge.addInput(clip);
            });
            ffmpeg_merge.mergeToFile(outputPath, tempPath)
                .on('end', resolve)
                .on('error', reject);
        });
    }

  public setDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath).ffprobe((err, metadata) => {
            if (err) reject(err);
            else if (typeof metadata.format.duration === 'number') {
                resolve(metadata.format.duration);
            } else {
              console.log(err)
                reject(new Error('Duration is undefined'));
            }
        });
    });
}
}
