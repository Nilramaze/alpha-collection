function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
}

function hslToRgbChannels(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return `${v} ${v} ${v}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const r = Math.round(hue2rgb(h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(h) * 255);
  const b = Math.round(hue2rgb(h - 1 / 3) * 255);
  return `${r} ${g} ${b}`;
}

export function applyAccentColor(hex: string): void {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return;

  const [h, s] = hexToHsl(hex);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const shade = (l: number) => hslToRgbChannels(h, Math.min(s, 90), l);
  const root = document.documentElement;

  root.style.setProperty('--brand-50',  shade(95));
  root.style.setProperty('--brand-100', shade(85));
  root.style.setProperty('--brand-200', `${r} ${g} ${b}`);
  root.style.setProperty('--brand-300', shade(40));
  root.style.setProperty('--brand-400', shade(32));
  root.style.setProperty('--brand-500', shade(26));
  root.style.setProperty('--brand-600', shade(21));
  root.style.setProperty('--brand-700', shade(16));
  root.style.setProperty('--brand-800', shade(11));
  root.style.setProperty('--brand-900', shade(7));
}
