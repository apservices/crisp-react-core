export async function mixAudioTracks(url1: string, url2: string, volume1 = 1, volume2 = 1): Promise<string> {
  const ctx = new AudioContext();
  const [r1, r2] = await Promise.all([fetch(url1), fetch(url2)]);
  const buf1 = await r1.arrayBuffer().then(a => ctx.decodeAudioData(a));
  const buf2 = await r2.arrayBuffer().then(a => ctx.decodeAudioData(a));

  const output = ctx.createMediaStreamDestination();
  const g1 = ctx.createGain(); g1.gain.value = volume1;
  const g2 = ctx.createGain(); g2.gain.value = volume2;

  const s1 = ctx.createBufferSource(); s1.buffer = buf1;
  const s2 = ctx.createBufferSource(); s2.buffer = buf2;

  s1.connect(g1).connect(output);
  s2.connect(g2).connect(output);
  s1.start(); s2.start();

  const audioUrl = URL.createObjectURL(output.stream as any);
  return audioUrl;
}
