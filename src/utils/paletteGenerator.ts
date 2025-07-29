import {
  formatHex,
  random,
  wcagContrast,
  parse,
  clampRgb,
  converter,
  type Color,
  type Oklch,
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
const toOklch = converter('oklch');


export const generateColorScale = (
  hue: number,
  chromaMultiplier = 1
): ColorScale => {
  const scale: Partial<ColorScale> = {};

  for (const [step, { l, c }] of Object.entries(SCALE_MAP)) {
    const key = Number(step) as keyof typeof SCALE_MAP;

    const adjustedChroma = Math.max(0.005, c * chromaMultiplier);
    const colorOklch: Oklch = {
      mode: 'oklch',
      l,
      c: adjustedChroma,
      h: hue,
    };

    const rgbColor = toRgb(colorOklch);
    const clampedColor = rgbColor ? clampRgb(rgbColor) : undefined;

    scale[key] = clampedColor ? formatHex(clampedColor) : '#000000';
  }

  return scale as ColorScale;
};

/**
 * Gera uma paleta de cores Tailwind a partir de uma cor base, garantindo que a cor original
 * esteja presente na paleta.
 * @param baseColor - A cor base em qualquer formato CSS válido (ex: '#3b82f6', 'rgb(59, 130, 246)').
 * @returns Uma escala de cores (ColorScale) ou null se a cor for inválida.
 */
export const generatePaletteFromColor = (baseColor: string): ColorScale | null => {
  let parsed: Color | undefined;
  try {
    parsed = parse(baseColor);
  } catch (e) {
    return null;
  }

  if (!parsed) {
    return null;
  }

  const oklch = toOklch(parsed);
  if (!oklch || oklch.h === undefined) {
    // Se não for possível obter um matiz (ex: cinzas), não podemos gerar uma paleta colorida.
    // Poderíamos gerar uma escala de cinzas aqui, mas por enquanto retornamos nulo.
    return null;
  }

  const { l: targetL, c: targetC, h } = oklch;

  // 1. Encontrar o "step" da escala mais próximo em luminosidade (L)
  const closestStep = (Object.keys(SCALE_MAP) as unknown as (keyof typeof SCALE_MAP)[]).reduce((prev, curr) => {
    return Math.abs(SCALE_MAP[curr].l - targetL) < Math.abs(SCALE_MAP[prev].l - targetL) ? curr : prev;
  });

  // 2. Calcular o "desvio" (offset) da cor do usuário em relação à escala padrão
  const lOffset = targetL - SCALE_MAP[closestStep].l;
  const cOffset = targetC - SCALE_MAP[closestStep].c;

  const newScale: Partial<ColorScale> = {};

  // 3. Gerar a nova escala ajustando L e C de cada step com o offset
  for (const [step, { l: baseL, c: baseC }] of Object.entries(SCALE_MAP)) {
    const key = Number(step) as keyof typeof SCALE_MAP;

    const newL = baseL + lOffset;
    const newC = baseC + cOffset;

    const newColorOklch: Oklch = {
      mode: 'oklch',
      l: Math.max(0, Math.min(1, newL)), // Garante que L esteja entre 0 e 1
      c: Math.max(0, newC), // Garante que C não seja negativo
      h,
    };

    const rgbColor = toRgb(newColorOklch);
    const clampedColor = rgbColor ? clampRgb(rgbColor) : undefined;
    newScale[key] = clampedColor ? formatHex(clampedColor) : '#000000';
  }

  // 4. Inserir a cor original do usuário no step mais próximo para garantir 100% de precisão
  newScale[closestStep] = formatHex(parsed);


  return newScale as ColorScale;
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

