import { useEffect, useState, useMemo } from 'react';
import { Header, GeneralOptionsButton } from '../../components/Components';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import {
  getContrastingTextColor,
  type ColorScale,
} from '../../utils/paletteGenerator';
import { RefreshCw } from 'lucide-react';
import { App, Breadcrumb, Button, Select } from 'antd';
import colorBlind from 'color-blind';
import colorNamer from 'color-namer';
import { parse, rgb, formatHex } from 'culori';
import { Link } from 'react-router-dom';

// Define os tipos de daltonismo que a biblioteca color-blind suporta
const colorBlindnessTypes = [
  'Protanopia',
  'Deuteranopia',
  'Tritanopia',
  'Achromatopsia',
  'Achromatomaly',
  'Deuteranomaly',
  'Protanomaly',
  'Tritanomaly',
];

// Define um tipo para as chaves de método esperadas do colorBlind
type ColorBlindnessMethodKey = Lowercase<typeof colorBlindnessTypes[number]>;

// Componente para renderizar uma única linha de escala de cores
const ColorScaleRow = ({
  title,
  scale,
}: {
  title: string;
  scale: ColorScale;
}) => {
  const { message: messageApi } = App.useApp();
  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    messageApi.success(`Cor ${color.toUpperCase()} copiada!`);
  };
  return (
    <div>
      <h3 className='text-lg font-semibold mb-2' style={{ color: scale[800] }}>
        {title}
      </h3>
      <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3'>
        {Object.entries(scale).map(([step, color]) => {
          const textColor = getContrastingTextColor(color as string);
          return (
            <div
              key={step}
              className="rounded-lg shadow-inner p-2 cursor-pointer transition-transform hover:scale-[1.03] active:scale-95"
              style={{ backgroundColor: color as string }}
              onClick={() => handleCopyColor(color as string)}
            >
              <span className="block text-xs font-bold" style={{ color: textColor }}>
                {step}
              </span>
              <span className="block font-mono text-xs opacity-80" style={{ color: textColor }}>
                {color as string}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ColorBlindSimulation = () => {
  const { palette, generateNewPalette } = usePaletteContext();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { message: messageApi } = App.useApp();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        generateNewPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [generateNewPalette]);

  // Função para aplicar a simulação de daltonismo a uma cor
  const simulateColor = (color: string, type: string | null): string => {
    if (!type || type === 'Normal') return color;

    // 1. Converte a cor HEX de entrada para um objeto RGB do culori
    const parsedColor = parse(color);
    if (!parsedColor) return color; // Retorna a cor original se não puder fazer parse

    const rgbColorObject = rgb(parsedColor);
    if (!rgbColorObject) return color; // Retorna a cor original se não puder ser convertida para RGB

    // 2. Formata para a string 'rgb(r,g,b)' que color-blind espera
    const rgbString = `rgb(${Math.round(rgbColorObject.r * 255)},${Math.round(
      rgbColorObject.g * 255
    )},${Math.round(rgbColorObject.b * 255)})`;

    // 3. Aplica a simulação de daltonismo de forma segura
    const methodKey = type.toLowerCase() as ColorBlindnessMethodKey;
    if (!(methodKey in colorBlind)) {
      messageApi.warning(`Método de simulação de daltonismo desconhecido: ${type}`);
      return color; // Retorna a cor original se o método não existir
    }
    // Afirmação de tipo para garantir que o TypeScript entenda o acesso
    const simulatedRgbString = colorBlind[methodKey as keyof typeof colorBlind](rgbString);

    // 4. Converte a string RGB simulada de volta para HEX usando culori
    const simulatedParsedColor = parse(simulatedRgbString);
    if (!simulatedParsedColor) return color; // Retorna a cor original se a simulada não puder ser parseada

    return formatHex(simulatedParsedColor) || color; // Retorna HEX ou a cor original como fallback
  };

  // Paleta simulada
  const simulatedPalette = useMemo(() => {
    if (!selectedType || selectedType === 'Normal') return palette;

    const newPalette = { ...palette };
    for (const scaleName of Object.keys(palette) as (keyof typeof palette)[]) { // Afirmação de tipo aqui
      newPalette[scaleName] = Object.fromEntries(
        Object.entries(palette[scaleName]).map(
          ([step, color]) => [
            step,
            simulateColor(color, selectedType),
          ]
        )
      ) as ColorScale;
    }

    return newPalette;
  }, [palette, selectedType]);

  const primaryName = colorNamer(palette.primary[500]).ntc[0].name;
  const grayName = colorNamer(palette.gray[500]).ntc[0].name;

  return (
    <>
      <GeneralOptionsButton />
      <div className='sticky top-0 z-50 bg-white dark:bg-shark-800 shadow-sm'>
        <Header />
      </div>
      <div
        className='min-h-screen transition-colors duration-500 overflow-x-hidden dark:bg-shark-800'
        style={{ backgroundColor: palette.gray[50] }}
      >
        <main className='container mx-auto px-4 py-8'>
          <div className='px-4 my-4'>
            <Breadcrumb
              items={[
                {
                  title: <Link to='/' className='dark:text-shark-50'>Home</Link>,
                },
                {
                  title: <span className='dark:text-shark-50'>Simulação de daltonismo</span>,
                },
              ]} 
            />
          </div>
          <section className='text-center px-4 py-10 max-w-4xl mx-auto'>
            <h1
              className='text-4xl md:text-5xl font-bold mb-4 dark:text-shark-50'
              style={{ color: palette.gray[900] }}
            >
              Como pessoas com daltonismo veem sua paleta?
            </h1>
            <p
              className='text-lg md:text-xl text-shark-700 dark:text-shark-100'
              style={{ color: palette.gray[600] }}
            >
              Esta ferramenta simula como diferentes tipos de daltonismo afetam
              a percepção das cores da sua paleta. Escolha um tipo de
              deficiência visual e visualize a paleta alterada. É uma maneira
              prática de criar experiências mais inclusivas.
            </p>
          </section>

          <div className='flex flex-col md:flex-row gap-5 md:gap-0 text-center md:text-start justify-between items-center mb-6'>
            <h1
              className='text-3xl font-bold dark:text-shark-50'
              style={{ color: palette.gray[900] }}
            >
              Simulação de Daltonismo
            </h1>
            <Button
              type='primary'
              size='large'
              icon={<RefreshCw size={20} />}
              onClick={generateNewPalette}
              style={{
                backgroundColor: palette.primary[500],
                color: getContrastingTextColor(palette.primary[500]),
              }}
            >
              Gerar Nova Paleta
            </Button>
          </div>

          <div className='mb-6'>
            <Select
              placeholder='Selecione um tipo de daltonismo'
              className='w-full md:w-1/4'
              onChange={(value) => setSelectedType(value)}
              options={[
                { value: 'Normal', label: 'Visão Normal' },
                ...colorBlindnessTypes.map((type) => ({
                  value: type,
                  label: type,
                })),
              ]}
            />
          </div>

          <div
            className='p-6 rounded-xl shadow-lg transition-colors duration-500'
            style={{ backgroundColor: palette.gray[100] }}
          >
            <div className='space-y-6'>
              <ColorScaleRow
                title={`Original: ${primaryName}`}
                scale={palette.primary}
              />
              <ColorScaleRow
                title={`Original: ${grayName}`}
                scale={palette.gray}
              />

              {selectedType && selectedType !== 'Normal' && (
                <>
                  <h2
                    className='text-2xl font-bold mt-8 mb-4'
                    style={{ color: palette.gray[900] }}
                  >
                    Simulação: {selectedType}
                  </h2>
                  <ColorScaleRow
                    title={`Simulado: ${primaryName}`}
                    scale={simulatedPalette.primary}
                  />
                  <ColorScaleRow
                    title={`Simulado: ${grayName}`}
                    scale={simulatedPalette.gray}
                  />
                </>
              )}
            </div>
          </div>
        </main>

        <footer
          className='text-center py-12'
          style={{ color: palette.gray[500] }}
        >
          <p>Feito com 💜 para a comunidade open source.</p>
        </footer>
      </div>
    </>
  );
};
