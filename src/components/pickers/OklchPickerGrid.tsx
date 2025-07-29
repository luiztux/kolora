import { useRef, useEffect, useState } from 'react';
import { oklch, formatHex, converter, parse } from 'culori';

const toSrgb = converter('rgb');

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 140;

const drawCanvas = (
  ctx: CanvasRenderingContext2D,
  mode: 'lightness-chroma' | 'lightness-hue' | 'chroma-hue',
  fixed: number,
) => {
  const image = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = image.data;

  for (let y = 0; y < CANVAS_HEIGHT; y++) {
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      let color;
      if (mode === 'lightness-chroma') {
        const lightness = 1 - y / CANVAS_HEIGHT;
        const chroma = x / CANVAS_WIDTH * 0.4;
        color = oklch({ mode: 'oklch', l: lightness, c: chroma, h: fixed });
      } else if (mode === 'lightness-hue') {
        const lightness = 1 - y / CANVAS_HEIGHT;
        const hue = (x / CANVAS_WIDTH) * 360;
        color = oklch({ mode: 'oklch', l: lightness, c: fixed, h: hue });
      } else {
        const chroma = x / CANVAS_WIDTH * 0.4;
        const hue = (y / CANVAS_HEIGHT) * 360;
        color = oklch({ mode: 'oklch', l: fixed, c: chroma, h: hue });
      }

      const rgb = toSrgb(color);
      const index = (y * CANVAS_WIDTH + x) * 4;

      if (rgb && rgb.r >= 0 && rgb.r <= 1 && rgb.g >= 0 && rgb.g <= 1 && rgb.b >= 0 && rgb.b <= 1) {
        data[index + 0] = Math.round(rgb.r * 255);
        data[index + 1] = Math.round(rgb.g * 255);
        data[index + 2] = Math.round(rgb.b * 255);
        data[index + 3] = 255;
      } else {
        data[index + 0] = 200;
        data[index + 1] = 200;
        data[index + 2] = 200;
        data[index + 3] = 255;
      }
    }
  }
  ctx.putImageData(image, 0, 0);
};

const PickerCanvas = ({
  mode,
  fixed,
  onPick,
}: {
  mode: 'lightness-chroma' | 'lightness-hue' | 'chroma-hue';
  fixed: number;
  onPick: (color: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCanvas(ctx, mode, fixed);
  }, [mode, fixed]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let color;
    if (mode === 'lightness-chroma') {
      const l = 1 - y / CANVAS_HEIGHT;
      const c = x / CANVAS_WIDTH * 0.4;
      color = oklch({ mode: 'oklch', l, c, h: fixed });
    } else if (mode === 'lightness-hue') {
      const l = 1 - y / CANVAS_HEIGHT;
      const h = (x / CANVAS_WIDTH) * 360;
      color = oklch({ mode: 'oklch', l, c: fixed, h });
    } else {
      const c = x / CANVAS_WIDTH * 0.4;
      const h = (y / CANVAS_HEIGHT) * 360;
      color = oklch({ mode: 'oklch', l: fixed, c, h });
    }

    const hex = formatHex(color);
    onPick(hex);
  };

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={handleClick} className="rounded border" />;
};

export const OklchPickerGrid = () => {
  const [color, setColor] = useState('#a348f7');
  const parsed = parse(color);
  const oklchColor = parsed ? converter('oklch')(parsed) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="mb-2 font-medium">Lightness × Chroma (h = {oklchColor?.h?.toFixed(0)})</p>
        <PickerCanvas mode="lightness-chroma" fixed={oklchColor?.h ?? 0} onPick={setColor} />
      </div>
      <div>
        <p className="mb-2 font-medium">Lightness × Hue (c = {oklchColor?.c?.toFixed(2)})</p>
        <PickerCanvas mode="lightness-hue" fixed={oklchColor?.c ?? 0.1} onPick={setColor} />
      </div>
      <div>
        <p className="mb-2 font-medium">Chroma × Hue (l = {oklchColor?.l?.toFixed(2)})</p>
        <PickerCanvas mode="chroma-hue" fixed={oklchColor?.l ?? 0.5} onPick={setColor} />
      </div>
      <div className="md:col-span-3">
        <p className="mt-4 font-semibold">Cor selecionada: <span style={{ background: color }} className="px-2 py-1 rounded text-white">{color}</span></p>
      </div>
    </div>
  );
};
