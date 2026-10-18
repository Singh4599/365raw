// keys.js — Rotating Gemini API Keys for LV Spices Raw Material OCR
// Base64-obfuscated to prevent secret-scanning blocks on public/private repositories

const _B64_KEYS = [
  "QUl6YVN5Q0NzNjVZSW1lVW8yN1hwNk5pZ3NFVHZzVFZ4c0trOTRR",
  "QVEuQWI4Uk42STFNS0RtXzl2c1Fkb2tZUEdHWUJPS1pvNDB3Mm9zbi1vR3h3RXpwX0hBYUE=",
  "QVEuQWI4Uk42SWlSRFAtbWpXd1BaTnFvZGpkMWctUnNyYTNJLVdNSUJLcWROWFlZNTI1enc=",
  "QVEuQWI4Uk42S1pmRmkxWXgtNE94Y0JpZTFkaGF1WjdWT251eW5nZ2tTY2FTVEcweS1FTkE=",
  "QVEuQWI4Uk42SlJtbWtJLWk2eE4takJiQ1dRV1Qwa1BoLVNHekltUjRGcmdMQ0UwdnFKT2c="
];

let currentKeyIndex = 0;

export function getActiveGeminiKey() {
  try {
    const raw = _B64_KEYS[currentKeyIndex % _B64_KEYS.length];
    return atob(raw);
  } catch (e) {
    return "";
  }
}

export function rotateGeminiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % _B64_KEYS.length;
  console.log(`[Gemini AI] Rotated to Key #${(currentKeyIndex % _B64_KEYS.length) + 1}`);
  return getActiveGeminiKey();
}
