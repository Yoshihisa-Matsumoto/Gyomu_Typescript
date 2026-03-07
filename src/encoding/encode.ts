const table: { [key: string]: number } = {
  '\u00a5': 0x5c,
  '\u203e': 0x7e,
  '\u301c': 0x8160,
};

const initTable = () => {
  if (table.length > 3) return;

  const decoder = new TextDecoder('shift-jis');
  for (let i = 0x81; i <= 0xfc; i++) {
    if (
      i <= 0x84 ||
      (i >= 0x87 && i <= 0x9f) ||
      (i >= 0xe0 && i <= 0xea) ||
      (i >= 0xed && i <= 0xee) ||
      i >= 0xfa
    ) {
      for (let j = 0x40; j <= 0xfc; j++) {
        const c = decoder.decode(new Uint8Array([i, j]));
        if (c.length === 1 && c !== '\ufffd' && !table[c]) {
          table[c] = (i << 8) | j;
        }
      }
    }
  }
};

export function encode2ShiftJIS(content: string) {
  initTable();
  const buffer = [];
  for (let i = 0; i < content.length; i++) {
    const c: number = content.codePointAt(i)!;
    if (c > 0xffff) {
      i++;
    }
    if (c < 0x80) {
      buffer.push(c);
    } else if (c >= 0xff61 && c <= 0xff9f) {
      buffer.push(c - 0xfec0);
    } else {
      const d = table[String.fromCodePoint(c)] || 0x3f;
      if (d > 0xff) {
        buffer.push((d >> 8) & 0xff, d & 0xff);
      } else {
        buffer.push(d);
      }
    }
  }
  return Uint8Array.from(buffer);
}
