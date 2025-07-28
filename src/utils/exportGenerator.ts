import namer from 'color-namer';
import { formatHex, rgb, hsl, oklch, parse } from 'culori';
import type { ExportablePalette } from '../contexts/panels/ExportPanelContext';

export const formatColor = (color: string, format: string): string => {
  const parsed = parse(color);
  if (!parsed) return color;

  switch (format) {
    case 'rgb': {
      const rgbColor = rgb(parsed);
      return rgbColor
        ? `rgb(${Math.round(rgbColor.r * 255)}, ${Math.round(
            rgbColor.g * 255
          )}, ${Math.round(rgbColor.b * 255)})`
        : color;
    }
    case 'hsl': {
      const hslColor = hsl(parsed);
      return hslColor
        ? `hsl(${Math.round(hslColor.h || 0)}, ${Math.round(
            hslColor.s * 100
          )}%, ${Math.round(hslColor.l * 100)}%)`
        : color;
    }
    case 'oklch': {
      const oklchColor = oklch(parsed);
      return oklchColor
        ? `oklch(${oklchColor.l.toFixed(2)}, ${oklchColor.c.toFixed(2)}, ${
            oklchColor.h?.toFixed(2) || '0.00'
          })`
        : color;
    }
    case 'hex':
    default:
      return formatHex(parsed) || color;
  }
};

const sanitizeName = (name: string) =>
  namer(name).ntc[0].name.replace(/\s/g, '-').toLowerCase();

export const generateTailwindCss = (
  palette: ExportablePalette,
  version: 'v3' | 'v4',
  colorFormat: string
) => {
  const primaryName = sanitizeName(palette.primary[500]);
  const grayName = sanitizeName(palette.gray[500]);

  const formatScale = (scale: any) =>
    Object.entries(scale)
      .map(([step, color]) => `${step}: '${formatColor(color as string, colorFormat)}',`)
      .join('\n          ');

  if (version === 'v3') {
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          ${formatScale(palette.primary)}
        },
        gray: {
          ${formatScale(palette.gray)}
        },
      },
    },
  },
};`;
  }

  return `@theme {
${Object.entries(palette.primary)
  .map(
    ([step, color]) =>
      `  --color-${primaryName}-${step}: ${formatColor(color, colorFormat)};`
  )
  .join('\n')}
${Object.entries(palette.gray)
  .map(
    ([step, color]) =>
      `  --color-${grayName}-${step}: ${formatColor(color, colorFormat)};`
  )
  .join('\n')}
}
/* Use: var(--color-${primaryName}-500) */`;
};

export const generateCss = (palette: ExportablePalette) => {
  const primaryName = sanitizeName(palette.primary[500]);
  const grayName = sanitizeName(palette.gray[500]);

  return `:root {
${Object.entries(palette.primary)
  .map(([step, color]) => `  --${primaryName}-${step}: ${color};`)
  .join('\n')}
${Object.entries(palette.gray)
  .map(([step, color]) => `  --${grayName}-${step}: ${color};`)
  .join('\n')}
}`;
};

export const generateScssLess = (palette: ExportablePalette) => {
  return `$primary: (
${Object.entries(palette.primary)
  .map(([step, color]) => `  ${step}: '${color}',`)
  .join('\n')}
);

$gray: (
${Object.entries(palette.gray)
  .map(([step, color]) => `  ${step}: '${color}',`)
  .join('\n')}
);

// Uso: color: map-get($primary, 500);`;
};

export const generateJson = (palette: ExportablePalette) =>
  JSON.stringify(palette, null, 2);


export const generatePaletteSvg = (
  palette: ExportablePalette
): string => {
  const swatchSize = 60;
  const gap = 10;
  const groups = Object.entries(palette);
  const maxSteps = Math.max(...groups.map(([_, scale]) => Object.keys(scale).length));
  const width = (swatchSize + gap) * maxSteps + gap;
  const height = (swatchSize + 40) * groups.length + gap;

  const rects = groups
    .map(([groupName, scale], groupIndex) => {
      const entries = Object.entries(scale);
      return entries
        .map(([step, color], i) => {
          const x = gap + i * (swatchSize + gap);
          const y = gap + groupIndex * (swatchSize + 40);
          return `
            <g>
              <rect x="${x}" y="${y}" width="${swatchSize}" height="${swatchSize}" fill="${color}" rx="6"/>
              <text x="${x + swatchSize / 2}" y="${y + swatchSize + 14}" text-anchor="middle" font-size="10" fill="#333">
                ${groupName}.${step}
              </text>
            </g>`;
        })
        .join('\n');
    })
    .join('\n');

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="font-family: sans-serif;">
  ${rects}
</svg>`.trim();
};
