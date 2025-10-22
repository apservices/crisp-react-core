import React, { useEffect, useRef, useState } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { Button } from '@/components/ui/button';

export const AutoMixPlayer: React.FC = () => {
  const { tracks } = useTracks();
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    audio.src = tracks[currentIndex]?.url || '';
    audio.play();
    const handleEnded = () => {
      if (currentIndex < tracks.length - 1) {
        setCurrentIndex(i => i + 1);
      }
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentIndex, tracks]);

  if (tracks.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl shadow bg-gray-100 mt-6">
      <div className="text-xl font-semibold mb-2">AutoMix</div>
      <div className="mb-2">Tocando: {tracks[currentIndex]?.name}</div>
      <audio ref={audioRef} controls className="w-full" />
      <div className="flex gap-2 mt-2">
        <Button onClick={() => audioRef.current?.play()}>Play</Button>
        <Button onClick={() => audioRef.current?.pause()}>Pause</Button>
        <Button onClick={() => setCurrentIndex(i => (i + 1) % tracks.length)}>Next</Button>
      </div>
    </div>
  );
};
