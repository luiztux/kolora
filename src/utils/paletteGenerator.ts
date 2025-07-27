import {
  formatHex,
  random,
  wcagContrast,
  parse,
  clampRgb,
  converter,
  type Color,
} from 'culori';


const SCALE_MAP = {
  50: { l: 0.98, c: 0.012 },
  100: { l: 0.94, c: 0.025 },
  200: { l: 0.88, c: 0.05 },
  300: { l: 0.8, c: 0.09 },
  400: { l: 0.7, c: 0.13 },
  500: { l: 0.62, c: 0.15 },
  600: { l: 0.54, c: 0.135 },
  700: { l: 0.45, c: 0.11 },
  800: { l: 0.36, c: 0.08 },
  900: { l: 0.27, c: 0.05 },
  950: { l: 0.18, c: 0.025 },
};

export type ColorScale = Record<keyof typeof SCALE_MAP, string>;

// Conversores compatíveis com Culori v4
const toRgb = converter('rgb');

export const generateColorScale = (
  hue: number,
  chromaMultiplier = 1
): ColorScale => {
  const scale: Partial<ColorScale> = {};

  for (const [step, { l, c }] of Object.entries(SCALE_MAP)) {
    const key = Number(step) as keyof typeof SCALE_MAP;

    const adjustedChroma = Math.max(0.005, c * chromaMultiplier);
    const colorOklch = {
      mode: 'oklch',
      l,
      c: adjustedChroma,
      h: hue,
    } as const;

    const rgbColor: Color | undefined = toRgb(colorOklch);
    const clampedColor: Color | undefined = rgbColor
      ? clampRgb(rgbColor)
      : undefined;

    scale[key] = clampedColor ? formatHex(clampedColor) : '#000000';
  }

  return scale as ColorScale;
};

export const generateTailwindPalette = () => {
  const hue = random('oklch').h ?? 0;
  const primary = generateColorScale(hue);
  const gray = generateColorScale(hue, 0.05);

  return { primary, gray };
};

export const getContrastingTextColor = (backgroundColor: string): string => {
  const color = parse(backgroundColor);
  if (!color) return '#000000';

  const contrastWithWhite = wcagContrast(color, '#FFFFFF');
  const contrastWithBlack = wcagContrast(color, '#000000');

  return contrastWithWhite > contrastWithBlack ? '#FFFFFF' : '#000000';
};

