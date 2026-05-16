import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import introMusic from '@/assets/intro.mp3';

export default function BackgroundMusic({ autoStart }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      if (autoStart && !isMuted) {
        audioRef.current.play().catch(err => console.log("Autoplay blocked:", err));
        setIsPlaying(true);
      }
    }
  }, [autoStart]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      setIsMuted(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <audio ref={audioRef} src={introMusic} loop />
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className="rounded-full w-12 h-12 bg-background/80 backdrop-blur shadow-lg border-primary/20 hover:border-primary/50 transition-all"
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-primary" />
        ) : (
          <VolumeX className="w-6 h-6 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
