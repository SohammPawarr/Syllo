"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [isMuted, volume, playbackRate]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      if (!isFinite(duration) || duration === 0) return;
      const newTime = (Number(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full bg-[var(--gray-50)] border-2 border-[var(--gray-200)] rounded-xl p-3 shadow-sm flex flex-col gap-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[var(--brand-blue)] text-[var(--white)] flex items-center justify-center shrink-0 hover:bg-[var(--brand-light-blue)] shadow-sm transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[var(--gray-600)]">{formatTime(currentTime)} / {formatTime(duration)}</span>
            
            <div className="flex items-center gap-2">
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-[var(--brand-blue)] focus:outline-none cursor-pointer hover:bg-[var(--gray-200)] rounded px-1 transition-colors"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
          
          <div className="relative h-2 bg-[var(--gray-200)] rounded-full group cursor-pointer mt-1">
            <div 
              className="absolute top-0 left-0 h-full bg-[var(--brand-blue)] rounded-full"
              style={{ width: `${progress || 0}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.01"
              value={progress || 0}
              onInput={handleSeek}
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-1">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[var(--gray-500)] hover:text-[var(--brand-blue)] transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <div className="relative w-20 h-1.5 bg-[var(--gray-200)] rounded-full cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--gray-400)] rounded-full"
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
