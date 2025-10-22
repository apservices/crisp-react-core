import React, { useState, useEffect } from 'react';
import { useStudio } from '../hooks/useStudio';
import { useTracks } from '../hooks/useTracks';
import { mixAudioTracks } from '../utils/dualAudio';
import { useSubscription } from '@/hooks/useSubscription';

export const Studio: React.FC = () => {
  const { tracks } = useTracks();
  const { dualSelection, setDualSelection, dualTracks } = useStudio(tracks);
  const { isPro, isExpert } = useSubscription();
  const [vol1, setVol1] = useState(1);
  const [vol2, setVol2] = useState(1);
  const [mixedUrl, setMixedUrl] = useState<string | undefined>();

  useEffect(() => {
    const saved = localStorage.getItem('dualSelection');
    if (saved) setDualSelection(JSON.parse(saved));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('dualSelection', JSON.stringify(dualSelection));
    if (dualTracks.length === 2) {
      mixAudioTracks(dualTracks[0].url, dualTracks[1].url, vol1, vol2).then(setMixedUrl);
    }
  }, [dualSelection, vol1, vol2, dualTracks]);

  if (!(isPro || isExpert)) {
    return (
      <div className="p-6 text-foreground">
        Recurso disponível para planos Pro e Expert.{' '}
        <button className="underline">Upgrade agora</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Studio — Dual Audio Mix</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {tracks.map((t) => (
          <div
            key={t.id}
            className={`rounded border p-3 ${dualSelection.includes(t.id) ? 'bg-accent/20' : ''}`}
          >
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setDualSelection([t.id, dualSelection[1]])}
              >
                Deck 1: {t.title}
              </button>
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setDualSelection([dualSelection[0], t.id])}
              >
                Deck 2: {t.title}
              </button>
            </div>
          </div>
        ))}
      </div>
      {dualTracks.length === 2 && (
        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2">
            <span>Volume 1</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vol1}
              onChange={(e) => setVol1(parseFloat(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Volume 2</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vol2}
              onChange={(e) => setVol2(parseFloat(e.target.value))}
            />
          </label>
        </div>
      )}
      {mixedUrl && <audio src={mixedUrl} controls autoPlay />}
    </div>
  );
};

export default Studio;
