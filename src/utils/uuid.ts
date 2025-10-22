export function uuid(): string {
  const g: any = globalThis as any;
  const c: Crypto | undefined = g.crypto;

  // 1) Se existir, use a API nativa
  if (c && typeof (c as any).randomUUID === 'function') {
    return (c as any).randomUUID();
  }

  // 2) getRandomValues + formato v4
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    // version/variant
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex: string[] = Array.from(bytes, b => b.toString(16).padStart(2, '0'));
    // monta com hífens (8-4-4-4-12 nibbles)
    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-');
  }

  // 3) fallback fraco (só para não quebrar dev em ambientes muito antigos)
  let s = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) { s += '-'; continue; }
    if (i === 14) { s += '4'; continue; }
    const r = (Math.random() * 16) | 0;
    if (i === 19) { s += ((r & 0x3) | 0x8).toString(16); }
    else { s += r.toString(16); }
  }
  return s;
}
