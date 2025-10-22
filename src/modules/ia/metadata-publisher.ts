export interface TrackMetadata {
  title: string;
  artist: string;
  bpm: number;
  key: string;
  platforms: ("spotify" | "soundcloud" | "dropbox")[];
}

export function publishMetadata(meta: TrackMetadata): string[] {
  return meta.platforms.map((platform) => {
    return `Enviado para ${platform.toUpperCase()}: ${meta.title} - ${meta.artist} [${meta.bpm} BPM / ${meta.key}]`;
  });
}
