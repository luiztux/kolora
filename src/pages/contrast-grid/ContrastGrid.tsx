import { useEffect, useMemo, useState } from 'react';
import { wcagContrast, parse } from 'culori';
import { getContrastingTextColor } from '../../utils/paletteGenerator';
import { LayoutGrid, RefreshCw, Workflow } from 'lucide-react';
import { App, Button, Breadcrumb, Select, Tooltip } from 'antd';
import { Header, GeneralOptionsButton } from '../../components/Components';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import colorNamer from 'color-namer';
import { ContrastFlow } from './ContrastFlow';
import { Link } from 'react-router-dom';

// Função para verificar a conformidade WCAG
const getWCAGCompliance = (ratio: number) => {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
};

export const ContrastGrid = () => {
  const { palette, generateNewPalette } = usePaletteContext();
  const { message: messageApi } = App.useApp();

  // Combina todas as cores da paleta para usar na grade
  const allColors = useMemo(() => {
    const colors: string[] = [];
    for (const key in palette.primary) {
      colors.push(
        palette.primary[key as unknown as keyof typeof palette.primary]
      );
    }
    for (const key in palette.gray) {
      colors.push(palette.gray[key as unknown as keyof typeof palette.gray]);
    }
    return colors;
  }, [palette]);

  const [selectedBaseColor, setSelectedBaseColor] = useState<string>(
    allColors[0]
  );
  const [visualizationType, setVisualizationType] = useState<'grid' | 'flow'>(
    'grid'
  );

  const handleChangeVisualizationType = () => {
    setVisualizationType((prevVisualization) =>
      prevVisualization === 'grid' ? 'flow' : 'grid'
    );
  };

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

  // Calcula os nomes das paletas
  const primaryName = colorNamer(palette.primary[500]).ntc[0].name;
  const grayName = colorNamer(palette.gray[500]).ntc[0].name;

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    messageApi.success(`Cor ${color.toUpperCase()} copiada!`);
  };

  return (
    <>
      <GeneralOptionsButton />
      <div
        className='min-h-screen dark:bg-shark-800'
        style={{ backgroundColor: palette.gray[50] }}
      >
        <Header />
        <div className=' px-4 my-4'>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to='/' className='dark:text-shark-50'>
                    Home
                  </Link>
                ),
              },
              {
                title: (
                  <span className='dark:text-shark-50'>Contrast Grid</span>
                ),
              },
            ]}
          />
        </div>
        <main className='container px-4 py-8'>
          <div className='flex flex-col md:flex-row gap-5 md:gap-0 text-center md:text-start md:justify-between items-center mb-6'>
            <h1 className='text-3xl font-semibold dark:text-shark-50'>
              Contrast Grid para {primaryName} e {grayName}
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

          <div className='mb-6 flex justify-between items-center'>
            <div className={`grow ${visualizationType === 'flow' ? 'hidden' : ''}`}>
              <span
                className='block text-lg font-semibold mb-2 dark:text-shark-50'
                style={{ color: palette.gray[700] }}
              >
                Cor Base para Análise:
              </span>
              <Select
                className='w-full md:w-1/4'
                showSearch
                placeholder='Selecione uma cor para analisar'
                optionFilterProp='children'
                onChange={(value) => setSelectedBaseColor(value)}
                value={selectedBaseColor}
                options={allColors.map((color) => ({
                  value: color,
                  label: `${
                    colorNamer(color).html[0].name
                  } (${color.toUpperCase()})`,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </div>
            <div>
              <Tooltip
                title={`Ver como ${
                  visualizationType === 'grid' ? 'fluxo' : 'card'
                }`}
              >
                <Button
                  ghost
                  className='border-none text-shark-600'
                  icon={
                    visualizationType === 'grid' ? (
                      <Workflow size={20} />
                    ) : (
                      <LayoutGrid size={20} />
                    )
                  }
                  onClick={handleChangeVisualizationType}
                />
              </Tooltip>
            </div>
          </div>

          {visualizationType === 'grid' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {allColors.map((targetColor, index) => {
                const baseColorParsed = parse(selectedBaseColor || '#000000');
                const targetColorParsed = parse(targetColor || '#000000');

                const ratio =
                  baseColorParsed && targetColorParsed
                    ? wcagContrast(baseColorParsed, targetColorParsed)
                    : 0;

                const compliance = getWCAGCompliance(ratio);
                const textColorForCard = getContrastingTextColor(selectedBaseColor);

                return (
                  <div
                    key={index}
                    className='p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center'
                    style={{
                      backgroundColor: selectedBaseColor,
                      color: textColorForCard,
                    }}
                  >
                    <div
                      className='w-full h-16 rounded-md mb-2 flex items-center justify-center cursor-pointer'
                      style={{
                        backgroundColor: targetColor,
                        color: getContrastingTextColor(targetColor),
                      }}
                      onClick={() => handleCopyColor(targetColor)}
                    >
                      <span className='font-bold text-lg'>
                        {targetColor.toUpperCase()}
                      </span>
                    </div>
                    <p className='text-sm font-semibold'>
                      Bg: {colorNamer(selectedBaseColor).html[0].name}
                    </p>
                    <p className='text-sm font-semibold mb-2'>
                      Text: {colorNamer(targetColor).html[0].name}
                    </p>
                    <p className='text-lg font-bold'>{ratio.toFixed(2)}:1</p>
                    <span
                      className={`font-bold text-base ${
                        compliance === 'AAA'
                          ? 'text-green-500'
                          : compliance === 'AA'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {compliance}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <ContrastFlow allColors={allColors} />
          )}
        </main>
      </div>
    </>
  );
};
