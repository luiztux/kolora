import { useState, useMemo } from 'react';
import {
  Header,
  ColorWheelExportButton,
  GeneralOptionsButton,
} from '../../components/Components';
import { getContrastingTextColor } from '../../utils/paletteGenerator';
import { Button, Breadcrumb, Select, Input, App } from 'antd';
import {
  parse,
  oklch,
  formatHex,
  random,
  rgb,
  converter,
  wcagContrast,
} from 'culori';
import colorNamer from 'color-namer';
import ColorWheel from '@uiw/react-color-wheel';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

// Tipos de harmonia de cores
const harmonyTypes = [
  'Monocromático',
  'Análogo',
  'Complementar',
  'Triádico',
  'Tetrádico',
];

// Converte para sRGB para garantir que a cor seja representável em HEX
const srgbConverter = converter('rgb');

// Função utilitária para manter a matiz no intervalo [0, 360)
const normalizeHue = (h: number) => ((h % 360) + 360) % 360;
const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(num, max));

const generateHarmonyColors = (
  baseColorHex: string,
  type: string
): string[] => {
  const baseColor = parse(baseColorHex);

  if (!baseColor) return [baseColorHex];

  const oklchBase = oklch(baseColor);
  if (!oklchBase) {
    return [baseColorHex];
  }

  const { l, c, h = 0 } = oklchBase;

  if (c < 0.02) {
    return [baseColorHex];
  }

  const colors: string[] = [baseColorHex];

  const createColor = (deltaH: number, deltaL = 0): string | null => {
    const newHue = normalizeHue(h + deltaH);
    const newLightness = clamp(l + deltaL, 0, 1);

    const candidateOklch = {
      mode: 'oklch',
      l: newLightness,
      c,
      h: newHue,
    } as const;

    const rgbCandidate = rgb(candidateOklch);

    if (!rgbCandidate) return null;

    const hex = formatHex(srgbConverter(rgbCandidate));

    return hex ?? null;
  };

  const add = (deltaH: number, deltaL = 0) => {
    const color = createColor(deltaH, deltaL);
    if (color && !colors.includes(color)) colors.push(color);
  };

  switch (type) {
    case 'Monocromático':
      add(0, 0.1);
      add(0, -0.1);
      add(0, 0.2);
      add(0, -0.2);
      break;
    case 'Análogo':
      add(30);
      add(-30);
      break;
    case 'Complementar':
      add(180);
      break;
    case 'Triádico':
      add(120);
      add(240);
      break;
    case 'Tetrádico':
      add(60);
      add(180);
      add(240);
      break;
  }

  return colors.slice(0, 5);
};

const getAccessibilityRating = (contrast: number): 'AAA' | 'AA' | 'Fail' => {
  if (contrast >= 7) return 'AAA';
  if (contrast >= 4.5) return 'AA';
  return 'Fail';
};

export const ColorWheelPage = () => {
  const { message: messageApi } = App.useApp();
  const [baseColor, setBaseColor] = useState<string>(
    formatHex(random()) || '#FF0000'
  );
  const [harmonyType, setHarmonyType] = useState<string>(harmonyTypes[0]);

  const harmonyColors = useMemo(() => {
    return generateHarmonyColors(baseColor, harmonyType);
  }, [baseColor, harmonyType]);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    messageApi.success(`Cor ${color.toUpperCase()} copiada!`);
  };

  return (
    <>
      <GeneralOptionsButton />
      <div className='sticky top-0 z-50 bg-white dark:bg-shark-800 shadow-sm'>
        <Header />
      </div>
      <div className='min-h-screen dark:bg-shark-800 overflow-x-hidden'>
        <main className='container mx-auto px-4 py-8'>
          <div className='my-4'>
            <Breadcrumb
              items={[
                {
                  title: <Link to='/' className='dark:text-shark-50'>Home</Link>,
                },
                {
                  title: <span className='dark:text-shark-50'>Color Wheel</span>,
                },
              ]}
            />
          </div>
          <section className='text-center px-4 py-10 max-w-4xl mx-auto'>
            <h1
              className='text-4xl md:text-5xl font-bold mb-4 text-shark-600 dark:text-shark-50'
              style={{ color: getContrastingTextColor(baseColor) }}
            >
              Explore combinações harmônicas com a roda de cores
            </h1>
            <p
              className='text-lg md:text-xl text-shark-700 dark:text-shark-100'
              style={{ color: getContrastingTextColor(baseColor) }}
            >
              Use a roda de cores para gerar esquemas monocromáticos, análogos,
              complementares, triádicos ou tetrádicos a partir de qualquer cor.
              Ideal para criar interfaces coerentes e visualmente agradáveis.
            </p>
          </section>

          <div className='flex flex-col md:flex-row gap-4 mb-8 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <ColorWheel
                color={baseColor}
                onChange={(color) => setBaseColor(color.hex)}
                width={200}
                height={200}
              />
              <Input
                value={baseColor.toUpperCase()}
                onChange={(e) => setBaseColor(e.target.value)}
                style={{ width: 100, textAlign: 'center' }}
              />
            </div>

            <div className='flex flex-col gap-5'>
              <div>
                <div>
                  <span className='text-shark-600 dark:text-shark-50 font-semibold'>
                    Harmonia:
                  </span>
                </div>
                <Select
                  value={harmonyType}
                  onChange={(value) => setHarmonyType(value)}
                  style={{ width: 200 }}
                  options={harmonyTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </div>
              <Button
                onClick={() => setBaseColor(formatHex(random()) || '#FF0000')}
                type='default'
                icon={<RefreshCw size={16} />}
                style={{
                  backgroundColor: baseColor,
                  color: getContrastingTextColor(baseColor),
                }}
              >
                Cor Aleatória
              </Button>
            </div>
          </div>

          <div>
            <ColorWheelExportButton />
            <div
              className='grid gap-4'
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              }}
            >
              {harmonyColors.map((color, index) => {
                const contrastWithWhite = wcagContrast(color, '#ffffff');
                const contrastWithBlack = wcagContrast(color, '#000000');
                const bestContrast =
                  contrastWithWhite > contrastWithBlack
                    ? contrastWithWhite
                    : contrastWithBlack;
                const rating = getAccessibilityRating(bestContrast);
                return (
                  <div
                    key={index}
                    className='p-4 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer'
                    style={{ backgroundColor: color, minHeight: 140 }}
                    onClick={() => handleCopyColor(color)}
                  >
                    <span
                      className='font-bold text-lg'
                      style={{ color: getContrastingTextColor(color) }}
                    >
                      {color.toUpperCase()}
                    </span>
                    <span
                      className='text-sm opacity-75'
                      style={{ color: getContrastingTextColor(color) }}
                    >
                      {colorNamer(color).html[0].name}
                    </span>
                    <span
                      className='text-xs mt-1'
                      style={{ color: getContrastingTextColor(color) }}
                    >
                      Contraste: {rating}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className='text-center py-8'>
          <p className='text-shark-600 dark:text-shark-50'>
            Feito com 💜 para a comunidade open source.
          </p>
        </footer>
      </div>
    </>
  );
};
