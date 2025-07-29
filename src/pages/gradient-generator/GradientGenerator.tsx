import { useState, useMemo } from 'react';
import { hsl as toHsl, formatHex, parse } from 'culori';
import {
  Button,
  Breadcrumb,
  ColorPicker,
  Dropdown,
  Input,
  Slider,
  Select,
  App,
  Drawer,
  type MenuProps,
} from 'antd';
import { Ellipsis, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, GeneralOptionsButton } from '../../components/Components';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { useMediaQuery } from 'react-responsive';

export const GradientGenerator = () => {
  const { message: messageApi } = App.useApp();

  const isMobile = useMediaQuery({ query: '(max-width: 48rem)'})

  // Estado de HSL para cada cor
  const [hsl1, setHsl1] = useState({ h: Math.random() * 360, s: 1, l: 0.5 });
  const [hsl2, setHsl2] = useState({ h: Math.random() * 360, s: 1, l: 0.5 });

  const [gradientType, setGradientType] = useState<'linear' | 'radial'>(
    'linear'
  );
  const [rotation, setRotation] = useState<number>(90);
  const [position, setPosition] = useState<number>(50);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const color1 = useMemo(() => formatHex({ ...hsl1, mode: 'hsl' }), [hsl1]);
  const color2 = useMemo(() => formatHex({ ...hsl2, mode: 'hsl' }), [hsl2]);

  const gradientCss = useMemo(() => {
    if (gradientType === 'linear') {
      return `linear-gradient(${rotation}deg, ${color1}, ${color2})`;
    } else {
      return `radial-gradient(circle at ${position}% ${position}%, ${color1}, ${color2})`;
    }
  }, [color1, color2, gradientType, rotation, position]);

  const colors = [color1, color2];

  const handleCopyCss = () => {
    navigator.clipboard.writeText(gradientCss);
    messageApi.success('CSS do gradiente copiado!');
  };

  const handleExportPng = async () => {
    const previewId = isMobile
      ? 'gradient-preview-mobile'
      : 'gradient-preview-desktop';
    const node = document.getElementById(previewId);

    if (!node) {
      messageApi.error('Elemento do gradiente não encontrado!');
      return;
    }

    try {
      const dataUrl = await toPng(node);
      download(dataUrl, 'gradiente.png');
    } catch (err) {
      messageApi.error(`Erro ao exportar imagem: ${err}`);
    }
  };

  const handleExportTailwindV3 = () => {
    const theme = colors.reduce((acc, color, index) => {
      if (color) {
        acc[`--color-gradient-${index + 1}`] = color;
      }
      return acc;
    }, {} as Record<string, string>);

    const content = `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(theme, null, 2)}
    }
  }
}`;
    navigator.clipboard.writeText(content);
    messageApi.success('Conteúdo copiado');
  };

  const handleExportTailwindV4 = () => {
    const theme = colors.reduce((acc, color, index) => {
      if (color) {
        acc[`--color-gradient-${index + 1}`] = color;
      }
      return acc;
    }, {} as Record<string, string>);

    const themeCss = `@theme {\n${Object.entries(theme)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;

    navigator.clipboard.writeText(themeCss);
    messageApi.success('Conteúdo copiado');
  };

  const downloadOptions: MenuProps['items'] = [
    {
      label: (
        <Button
          ghost
          className='border-none pl-0 text-shark-600'
          onClick={handleCopyCss}
        >
          Copiar CSS
        </Button>
      ),
      key: 'Copiar CSS',
    },
    {
      label: (
        <Button
          ghost
          className='border-none pl-0 text-shark-600'
          onClick={handleExportPng}
        >
          Download PNG
        </Button>
      ),
      key: 'Download PNG',
    },
    {
      label: (
        <Button
          ghost
          className='border-none pl-0 text-shark-600'
          onClick={handleExportTailwindV3}
        >
          Exportar TailwindCSS (v3)
        </Button>
      ),
      key: 'Exportar TailwindCSS (v3)',
    },
    {
      label: (
        <Button
          ghost
          className='border-none pl-0 text-shark-600'
          onClick={handleExportTailwindV4}
        >
          Exportar TailwindCSS (v4)
        </Button>
      ),
      key: 'Exportar TailwindCSS (v4)',
    },
  ];

  const generateRandomColors = () => {
    setHsl1({ h: Math.random() * 360, s: 1, l: 0.5 });
    setHsl2({ h: Math.random() * 360, s: 1, l: 0.5 });
  };

  return (
    <>
      <GeneralOptionsButton />
      <div className='min-h-screen bg-gray-100 dark:bg-shark-800'>
        <div className='sticky top-0 z-50 bg-white dark:bg-shark-800 shadow-sm'>
          <Header />
        </div>
        <div className='px-4 my-4'>
          <Breadcrumb
            items={[
              { title: <Link to='/' className='dark:text-shark-50'>Home</Link> },
              { title: <span className='dark:text-shark-50'>Gradient Generator</span> },
            ]}
          />
        </div>

        <main className='container mx-auto flex flex-col gap-8 px-4 py-8 md:flex-row'>
          {/* Visualização para Mobile */}
          {isMobile && (
            <div className='relative h-80 overflow-hidden rounded-lg bg-gray-200 shadow-md'>
              <div
                id='gradient-preview-mobile'
                className='h-full w-full'
                style={{ background: gradientCss }}
              ></div>
              <Button
                type='text'
                icon={<Maximize2 size={20} />}
                className='absolute right-2 top-2 text-white hover:text-gray-300'
                onClick={() => setIsDrawerOpen(true)}
              />
            </div>
          )}

          {/* Painel de controles */}
          <div className='flex-1 space-y-6 rounded-lg bg-white p-6 shadow dark:bg-shark-700'>
            <h1 className='text-2xl font-bold text-shark-900 dark:text-white'>
              Gerador de Gradientes
            </h1>

            {[
              { hsl: hsl1, setHsl: setHsl1, title: 'Cor 1', color: color1 },
              { hsl: hsl2, setHsl: setHsl2, title: 'Cor 2', color: color2 },
            ].map(({ hsl, setHsl, title, color }, i) => {
              const update = (key: 'h' | 's' | 'l') => (value: number) =>
                setHsl({ ...hsl, [key]: value });
              const handleHexChange = (hex: string) => {
                try {
                  const parsed = parse(hex);
                  if (parsed) {
                    const asHsl = toHsl(parsed);
                    if (asHsl && asHsl.h !== undefined) {
                      setHsl({ h: asHsl.h, s: asHsl.s, l: asHsl.l });
                    }
                  }
                } catch (e) {
                  console.error(e);
                }
              };
              return (
                <div key={i} className='space-y-4'>
                  <span className='block text-lg font-semibold text-shark-800 dark:text-white'>
                    {title}
                  </span>

                  {/* Color Picker + Input */}
                  <div className='flex items-center gap-2'>
                    <ColorPicker
                      value={color}
                      onChange={(c) => handleHexChange(c.toHexString())}
                    />
                    <Input
                      value={color.toUpperCase()}
                      onChange={(e) => handleHexChange(e.target.value)}
                      style={{ width: 120 }}
                    />
                  </div>

                  {/* Sliders */}
                  <div>
                    <span className='block font-medium dark:text-shark-50'>
                      Matiz (H): {Math.round(hsl.h)}
                    </span>
                    <Slider
                      min={0}
                      max={360}
                      value={hsl.h}
                      onChange={update('h')}
                    />
                  </div>
                  <div>
                    <span className='block font-medium dark:text-shark-50'>
                      Saturação (S): {Math.round(hsl.s * 100)}%
                    </span>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={hsl.s}
                      onChange={update('s')}
                    />
                  </div>
                  <div>
                    <span className='block font-medium dark:text-shark-50'>
                      Luminosidade (L): {Math.round(hsl.l * 100)}%
                    </span>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={hsl.l}
                      onChange={update('l')}
                    />
                  </div>
                </div>
              );
            })}

            <div>
              <span className='mb-2 block text-lg font-semibold text-shark-800 dark:text-white'>
                Tipo de Gradiente
              </span>
              <Select
                value={gradientType}
                onChange={setGradientType}
                style={{ width: '100%' }}
                options={[
                  { label: 'Linear', value: 'linear' },
                  { label: 'Radial', value: 'radial' },
                ]}
              />
            </div>

            {gradientType === 'linear' && (
              <div>
                <span className='mb-2 block text-lg font-semibold text-shark-800 dark:text-white'>
                  Rotação ({rotation}°)
                </span>
                <Slider
                  min={0}
                  max={360}
                  value={rotation}
                  onChange={setRotation}
                />
              </div>
            )}

            {gradientType === 'radial' && (
              <div>
                <span className='mb-2 block text-lg font-semibold text-shark-800 dark:text-white'>
                  Posição ({position}%)
                </span>
                <Slider
                  min={0}
                  max={100}
                  value={position}
                  onChange={setPosition}
                />
              </div>
            )}

            <div className='flex gap-4'>
              <Button
                icon={<RefreshCw size={16} />}
                onClick={generateRandomColors}
              >
                Cores Aleatórias
              </Button>
              <Dropdown
                menu={{ items: downloadOptions }}
                trigger={['click']}
                placement='topLeft'
              >
                <Button
                  type='text'
                  icon={
                    <Ellipsis
                      size={20}
                      className='text-shark-600 dark:text-shark-50'
                    />
                  }
                />
              </Dropdown>
              {/* <Button onClick={handleCopyCss}>Copiar CSS</Button> */}
            </div>
          </div>

          {/* Visualização para Desktop */}
          {!isMobile && (
            <div className='relative flex-1 overflow-hidden rounded-lg bg-gray-200 shadow-md'>
              <div
                id='gradient-preview-desktop'
                className='h-full w-full'
                style={{ background: gradientCss }}
              ></div>
              <Button
                type='text'
                icon={<Maximize2 size={20} />}
                className='absolute right-2 top-2 text-white hover:text-gray-300'
                onClick={() => setIsDrawerOpen(true)}
              />
            </div>
          )}
        </main>

        {/* Drawer em tela cheia */}
        <Drawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          footer={null}
          placement='bottom'
          height='100dvh'
          closable={false}
          maskClosable
          styles={{
            body: {
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <div
            className='w-full h-full flex justify-end'
            style={{ background: gradientCss }}
          >
            <Button
              ghost
              className='border-none pr-2 pt-2 z-10'
              icon={<Minimize2 size={20} className='text-white' />}
              onClick={() => setIsDrawerOpen(false)}
            />
          </div>
        </Drawer>
      </div>
    </>
  );
};
