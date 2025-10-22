
import { Track } from '@/types';

// Audio compatibility utilities
export function convertTrackForMixing(track: Track) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    bpm: track.bpm,
    key: track.key_signature,
    duration: track.duration,
    url: track.file_url || track.file_path,
    file_path: track.file_path
  };
}

export function normalizeTrackData(track: any): Track {
  return {
    ...track,
    type: (track.type || 'track') as 'track' | 'remix' | 'sample',
    name: track.title,
    url: track.file_url || track.file_path
  };
}

export function getMixCompatibility(track1: any, track2: any) {
  let score = 50; // Base compatibility

  // BPM compatibility
  if (track1.bpm && track2.bpm) {
    const bpmDiff = Math.abs(track1.bpm - track2.bpm);
    if (bpmDiff <= 2) score += 25;
    else if (bpmDiff <= 5) score += 15;
    else if (bpmDiff <= 10) score += 5;
  }

  // Key compatibility
  if (track1.key_signature && track2.key_signature) {
    if (track1.key_signature === track2.key_signature) score += 20;
    else score += 10; // Different but can work
  }

  // Genre compatibility
  if (track1.genre && track2.genre) {
    if (track1.genre === track2.genre) score += 15;
    else score += 5;
  }

  // Energy level compatibility
  if (track1.energy_level && track2.energy_level) {
    const energyDiff = Math.abs(track1.energy_level - track2.energy_level);
    if (energyDiff <= 1) score += 10;
    else if (energyDiff <= 2) score += 5;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons: []
  };
}
