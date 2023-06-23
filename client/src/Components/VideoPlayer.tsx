import React, { useRef, useState, useEffect , MouseEvent} from "react";
import { useParams } from "react-router-dom";
import screenfull from "screenfull";
import './css/VideoPlayer.css';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaCompress, FaExpand } from 'react-icons/fa';
import { MdPictureInPicture } from 'react-icons/md';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';


const VideoPlayer: React.FC = () => {
const { videoPath } = useParams<{ videoPath: string }>();
const src = `http://localhost:3001/uploaded_files/uploads/${videoPath}`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPIPMode, setIsPIPMode] = useState(false);

const [isScrubbing, setIsScrubbing] = useState(false);
const [wasPaused, setWasPaused] = useState(false);
const [previewImgNumber, setPreviewImgNumber] = useState(1);
const [previewImgSrc, setPreviewImgSrc] = useState("");
const timelineContainerRef = useRef<HTMLDivElement | null>(null);
const [currentTimeText, setCurrentTimeText] = useState("");

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  })

function formatDuration(time: number) {
    const seconds = Math.floor(time % 60)
    const minutes = Math.floor(time / 60) % 60
    const hours = Math.floor(time / 3600)
    if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`
    } else {
        return `${hours}:${leadingZeroFormatter.format(
            minutes
        )}:${leadingZeroFormatter.format(seconds)}`
    }
  }
  

const handleTimelineUpdate = (e: MouseEvent) => {
    const rect = timelineContainerRef.current?.getBoundingClientRect();
    if (rect && videoRef.current?.duration) {
        const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
        setPreviewImgNumber(Math.max(1, Math.floor((percent * videoRef.current.duration) / 2)));
        timelineContainerRef.current?.style.setProperty("--preview-position", `${percent}`);
        console.log((percent * videoRef.current.duration) / 2)
        var curDuration = formatDuration(videoRef.current.duration * percent)
        setCurrentTimeText(curDuration);

        const filename = videoPath!.split('.').slice(0, -1).join('.');
        const newPreviewImgSrc = `http://localhost:3001/uploaded_files/Preview/${filename}/preview-0${previewImgNumber}.jpg`
        setPreviewImgSrc(newPreviewImgSrc);

        if (isScrubbing) {
            e.preventDefault()
            setPreviewImgSrc(newPreviewImgSrc);
            console.log(newPreviewImgSrc)
            timelineContainerRef.current?.style.setProperty("--progress-position", `${percent}`)
        }
    }
};

const toggleScrubbing = (e: MouseEvent) => {
    const rect = timelineContainerRef.current?.getBoundingClientRect();
    if (rect && videoRef.current) {
        const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
        const isMouseDown = (e.buttons & 1) === 1;
        setIsScrubbing(isMouseDown);

        if (isMouseDown) {
            setWasPaused(videoRef.current.paused);
            videoRef.current.pause();
        } else {
            videoRef.current.currentTime = percent * videoRef.current.duration;
            if (!wasPaused) videoRef.current.play();
        }

        handleTimelineUpdate(e);
    }
};
useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
  
    const handleTimeUpdate = () => {
      if(video.duration){
        const percent = (video.currentTime / video.duration) * 100;
        setProgress(percent);
        console.log(timelineContainerRef)
        timelineContainerRef.current?.style.setProperty("--progress-position", `${percent}%`);

      }
    };
  
    const handleVideoEnd = () => {
      setIsPlaying(false);
    };
  
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnd);
  
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, []);
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    setVolume(volume);
    setIsMuted(!volume);
  };



  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (volume == 0){
        setVolume(1)
    }else{
        setVolume(0);
    }
   
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleFullScreen = () => {
    if (screenfull.isEnabled && containerRef.current) {
        screenfull.toggle(containerRef.current);
        setIsFullScreen(!isFullScreen);
    }
  };

  const handlePIPMode = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
      if (isPIPMode) {
        document.exitPictureInPicture();
      } else {
        video.requestPictureInPicture();
      }
      setIsPIPMode(!isPIPMode);
    }
  };


    return (
    <div>
      <div className="video-container paused" ref={containerRef}>
          <div className="video-controls-container">
          <div className="timeline-container" 
                onMouseMove={handleTimelineUpdate}
                onMouseDown={toggleScrubbing}
                onMouseUp={toggleScrubbing}
                ref={timelineContainerRef}
            >
                <div className="timeline-padding"></div>
                <div className="timeline">
                <img className="preview-img" src={previewImgSrc} alt="preview" />
                <span className="current-time-timeline">{currentTimeText}</span>
                <div className="thumb-indicator"></div>
                </div>
            </div>
                    
            <div className="controls">
              <button onClick={handlePlayPause} className="play-pause-btn">
            
              {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <div className="volume-container">
              <button onClick={handleMute} className="mute-btn">
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input className="volume-slider" type="range" min="0" max="1" step="any" value={volume} onChange={handleVolumeChange}/>
              </div>
              <div className="duration-container">
                <div className="duration">{`${formatDuration(videoRef.current?.currentTime || 0)} / ${formatDuration(videoRef.current?.duration || 0)}`}</div>
              </div>
              <button onClick={handlePIPMode} className="pipButton">
              <MdPictureInPicture />
              </button>

              <button onClick={handleFullScreen} className="wideScreenButton">
                {isFullScreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
          <video src={src} ref={videoRef} className="video" onClick={handlePlayPause}></video>

          </div>
          <div className="edit-button-container">
            <button>
              <div>
                <Link to={`/videoedit/${videoPath}`}>
                  <EditOutlined key="edit" />    
                </Link>
              </div>
            </button>
          </div>
    </div>
    );
    


};

export default VideoPlayer;
//                     
