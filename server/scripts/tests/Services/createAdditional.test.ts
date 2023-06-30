import { IAdditional } from './../../Interfaces/IAdditional';
import  mockFs from 'mock-fs';
import { FfmpegWrapper } from '../../Services/ffmpegWrapper';
import Misc from '../../Services/createAdditional';
import { instance, mock, when, anything, verify, anyString, capture, } from 'ts-mockito';
import { deepStrictEqual } from 'assert';
import fs from 'fs';
import { rimraf } from 'rimraf';

describe('Misc', () => {
    let ffmpegWrapperMock: FfmpegWrapper;
    let ffmpegWrapperSpy: FfmpegWrapper;
    let testedClass: IAdditional;

    const path: string = 'path';
    const filename: string = 'filename.mp4';
    const filenameNoDot: string = 'test-filename';

    beforeEach(async () => {
    const clips: { [key: string]: string } = {};
        for (let i = 0; i < 15; i++) {
            clips[`clip_${i}.mp4`] = 'dummy content'; // Or you can leave it as an empty string ''
        }
    

        // Mock the fs module
        mockFs({
            'uploaded_files/ShortVideos/filename':clips,
        });
        ffmpegWrapperMock = mock(FfmpegWrapper);
        ffmpegWrapperSpy = instance(ffmpegWrapperMock);
        
        when(ffmpegWrapperMock.generateThumbnail(anything(), anything(), anything(), anything())).thenResolve();
        when(ffmpegWrapperMock.createPreview(anything(), anything(), anything())).thenResolve();

        when(ffmpegWrapperMock.createShortVideoClip(anything(), anything(), anything())).thenResolve();
        when(ffmpegWrapperMock.mergeShortVideoClips(anything(), anything(), anything())).thenResolve();

        testedClass = new Misc(path, filename, ffmpegWrapperSpy);

    });

    afterEach(async () => {
        rimraf.sync('server');
        mockFs.restore();
    });

    describe('create_thumbnail', () => {
        it('should generate thumbnails successfully', async () => {
            const mkdirSpy = jest.spyOn(fs, 'mkdirSync');
            await testedClass.setDuration(path);

            const save_path: string = 'uploaded_files/Thumbnails/';
            const thumbnailPath: string = `${save_path}${filename.split('.').slice(0, -1).join('.')}`;

            await testedClass.create_thumbnail();

            expect(mkdirSpy).toHaveBeenCalledWith(save_path, { recursive: true });
            expect(mkdirSpy).toHaveBeenCalledWith(thumbnailPath, { recursive: true });

            for(let i = 0; i < 5; i++) {

                const timeMark: number = i * (testedClass.getDuration() / 5);
                const thumbnailName: string = `screenshot_${i}.png`;
                const thumbnailPath:string = `uploaded_files/Thumbnails/${filename.split('.').slice(0, -1).join('.')}`;
        
                verify(ffmpegWrapperMock.generateThumbnail(path, thumbnailPath, timeMark, thumbnailName)).once();
            }

        });
        
        it('should handle filename without dot', async () => {
            await expect(testedClass.create_thumbnail(path, filenameNoDot)).rejects.toThrow('Invalid filename. Filename must contain a dot.');
        });

        it('should throw error when thumbnail generation fails', async () => {
            when(ffmpegWrapperMock.generateThumbnail(anything(), anything(), anything(), anything())).thenReject(new Error('Test Error'));
    
            await expect(testedClass.create_thumbnail()).rejects.toThrow('Error generating thumbnails: Error: Test Error');
    
            when(ffmpegWrapperMock.generateThumbnail(anything(), anything(), anything(), anything())).thenResolve();
        });
    });


    describe("setDuration", () => {
        it('should set duration successfully', async () => {
            await testedClass.setDuration(path);
            verify(ffmpegWrapperMock.setDuration(path)).once();
        });
    });


    describe("create_preview", () => {
        it('should generate previews successfully and create necessary folders', async () => {

    
            const mkdirSpy = jest.spyOn(fs, 'mkdirSync');
            await testedClass.setDuration(path);

            await testedClass.create_preview();
    
            const save_path: string = 'uploaded_files/Preview/';
            const PreviewPath: string = `${save_path}${filename.split('.').slice(0, -1).join('.')}`;
            const fps: number = 0.5;
    
            expect(mkdirSpy).toHaveBeenCalledWith(save_path, { recursive: true });
            expect(mkdirSpy).toHaveBeenCalledWith(PreviewPath, { recursive: true });
    
            verify(ffmpegWrapperMock.createPreview(path, PreviewPath, fps)).once();
    


        });

        it('should handle filename without dot', async () => {
            await expect(testedClass.create_preview(path, filenameNoDot)).rejects.toThrow('Invalid filename. Filename must contain a dot.');
        });

        it('should throw error when preview generation fails', async () => {
            when(ffmpegWrapperMock.createPreview(anything(), anything(), anything())).thenReject(new Error('Test Error'));
    
            await expect(testedClass.create_preview()).rejects.toThrow('Error generating previews: Error: Test Error');
    
            when(ffmpegWrapperMock.createPreview(anything(), anything(), anything())).thenResolve();
        });
    });

    describe('createShortVideo', () => {

        it('should generate short video clips successfully', async () => {
            const path = 'path';
            const filename = 'filename.mp4';
            const num_clips = 15;
            await testedClass.setDuration(path);
            await testedClass.createShortVideo();
    
            for(let i = 0; i < num_clips; i++) {
                const startTime = i * (testedClass.getDuration() / num_clips);
                const output_filename = `uploaded_files/ShortVideos/${filename.split('.').slice(0, -1).join('.')}/clip_${i}.mp4`;
    
                verify(ffmpegWrapperMock.createShortVideoClip(path, startTime, output_filename)).once();
                
            }
        });

        it('should handle filename without dot', async () => {
            await expect(testedClass.createShortVideo(path, filenameNoDot)).rejects.toThrow('Invalid filename. Filename must contain a dot.');
        });
 

        it('should merge short video clips successfully', async () => {

            const tempPath = `uploaded_files/ShortVideos/${filename.split('.').slice(0, -1).join('.')}`;
            const outputPath = `${tempPath}/output.mp4`;

            await testedClass.createShortVideo();
            let clips = [];
            for(let i = 0; i < 15; i++) {
                const output_filename = `${tempPath}/clip_${i}.mp4`;
                clips.push(output_filename);
            }



            const [capturedClips, capturedOutputPath, capturedTempPath] = capture(ffmpegWrapperMock.mergeShortVideoClips).last();

            expect(capturedClips).toStrictEqual(clips);
            expect(capturedOutputPath).toStrictEqual(outputPath);
            expect(capturedTempPath).toStrictEqual(tempPath);
            deepStrictEqual(capturedClips, clips);
            
 
    
        }); 
        it('should throw error when createShortVideoClip fails', async () => {
            when(ffmpegWrapperMock.createShortVideoClip(anyString(), anything(), anyString())).thenReject(new Error('Test Error'));
    
            await expect(testedClass.createShortVideo()).rejects.toThrow('Error generating short video clip: Error: Test Error');
        });
    
        it('should throw error when mergeShortVideoClips fails', async () => {
            when(ffmpegWrapperMock.mergeShortVideoClips(anything(), anyString(), anyString())).thenReject(new Error('Test Error'));
    
            await expect(testedClass.createShortVideo()).rejects.toThrow('Error merging short video clips: Error: Test Error');
        });

        it('should remove the temporary video clips after merging', async () => {
            // Arrange
            const unlinkMock = jest.spyOn(fs, 'unlink');
            unlinkMock.mockImplementation((path, callback) => callback(null));
    

            const clips = [];
            for (let i = 0; i < 15; i++) {
                clips.push(`uploaded_files/ShortVideos/filename/clip_${i}.mp4`);
            }
            
            when(ffmpegWrapperMock.createShortVideoClip(anyString(), anything(), anyString())).thenResolve();
            when(ffmpegWrapperMock.mergeShortVideoClips(clips, anything(), anything())).thenResolve();
    
            await testedClass.createShortVideo();
    
            clips.forEach((clip) => {
                expect(unlinkMock).toHaveBeenCalledWith(clip, expect.any(Function));
            });
    
            unlinkMock.mockRestore();
        });
    });
    
});

