import React, { useState } from 'react';
import bpmDetective from 'bpm-detective';

// Interface simples para Track (adicione campos conforme seu projeto real)
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number | null;
  key_signature?: string | null;
  genre?: string | null;
  energy_level?: number | null;
}

const DualPlayer: React.FC = () => {
  const [leftTrack, setLeftTrack] = useState<Track | null>(null);
  const [rightTrack, setRightTrack] = useState<Track | null>(null);

  // Função para analisar áudio e retornar um Track
  const analyzeTrack = async (file: File): Promise<Track> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        window.audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
          // Extrai BPM
          const channelData = audioBuffer.getChannelData(0);
          const bpm = Math.round(bpmDetective(channelData));
          // Calcula duração
          const seconds = Math.round(audioBuffer.duration);
          const duration = `${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2, '0')}`;
          resolve({
            id: file.name,
            title: file.name,
            artist: 'Unknown',
            duration,
            bpm,
            key_signature: null,
            genre: null,
            energy_level: null
          });
        });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSelectTrack = async (side: 'left' | 'right') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      const track = await analyzeTrack(file);
      if (side === 'left') setLeftTrack(track);
      else setRightTrack(track);
    };
    input.click();
  };

  return (
    <div style={{ display: "flex", gap: 32, padding: 24 }}>
      {/* Deck A */}
      <div style={{ flex: 1, border: "1px solid #222", borderRadius: 12, padding: 24 }}>
        <h2>Deck A</h2>
        <button onClick={() => handleSelectTrack('left')}>
          Selecionar faixa
        </button>
        {leftTrack && (
          <div style={{ marginTop: 16 }}>
            <b>{leftTrack.title}</b>
            <div>BPM: {leftTrack.bpm}</div>
            <div>Duração: {leftTrack.duration}</div>
          </div>
        )}
      </div>
      {/* Deck B */}
      <div style={{ flex: 1, border: "1px solid #222", borderRadius: 12, padding: 24 }}>
        <h2>Deck B</h2>
        <button onClick={() => handleSelectTrack('right')}>
          Selecionar faixa
        </button>
        {rightTrack && (
          <div style={{ marginTop: 16 }}>
            <b>{rightTrack.title}</b>
            <div>BPM: {rightTrack.bpm}</div>
            <div>Duração: {rightTrack.duration}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualPlayer;