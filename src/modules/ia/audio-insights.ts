export function getAudioInsights(audioBuffer: AudioBuffer): {
  duration: number;
  peak: number;
  averageEnergy: number;
} {
  const channelData = audioBuffer.getChannelData(0);
  let peak = 0;
  let energy = 0;

  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.abs(channelData[i]);
    peak = Math.max(peak, sample);
    energy += sample * sample;
  }

  const averageEnergy = energy / channelData.length;

  return {
    duration: audioBuffer.duration,
    peak,
    averageEnergy,
  };
}
