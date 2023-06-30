import { useState, useEffect, useRef } from 'react';
import screenfull from 'screenfull';

export const useVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPIPMode, setIsPIPMode] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
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

  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    setVolume(volume);
    setIsMuted(!volume);
  };

  const handleProgressChange = (currentTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = (currentTime / 100) * video.duration;
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullScreen = () => {
    if (screenfull.isEnabled && videoRef.current) {
        screenfull.toggle(videoRef.current);
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

  return { videoRef, isPlaying, progress, volume, isMuted, isFullScreen, isPIPMode, handlePlayPause, handleVolumeChange, handleProgressChange, handleMute, handleFullScreen, handlePIPMode };
};
