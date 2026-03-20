const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const lookup = new Uint8Array(256);
for (let i = 0; i < CHARS.length; i++) {
  lookup[CHARS.charCodeAt(i)] = i;
}

/** Decode a base64 string into an ArrayBuffer (no deps). */
export function decode(b64: string): ArrayBuffer {
  let bufLen = b64.length * 0.75;
  if (b64[b64.length - 1] === "=") bufLen--;
  if (b64[b64.length - 2] === "=") bufLen--;

  const bytes = new Uint8Array(bufLen);
  let p = 0;

  for (let i = 0; i < b64.length; i += 4) {
    const e1 = lookup[b64.charCodeAt(i)];
    const e2 = lookup[b64.charCodeAt(i + 1)];
    const e3 = lookup[b64.charCodeAt(i + 2)];
    const e4 = lookup[b64.charCodeAt(i + 3)];

    bytes[p++] = (e1 << 2) | (e2 >> 4);
    bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }

  return bytes.buffer as ArrayBuffer;
}
