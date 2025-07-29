import { useState, useMemo, useEffect } from 'react';
import {
  parse,
  formatHex,
  formatRgb,
  formatHsl,
  type Oklch,
  type Lch,
  type Lab,
  type Oklab,
  type Lrgb,
  type P3,
  converter,
} from 'culori';
import {
  Card,
  ConfigProvider,
  Input,
  Select,
  Slider,
  App,
  Breadcrumb,
  ColorPicker,
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import { Header, GeneralOptionsButton } from '../../components/Components';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../contexts/Contexts';

const { Option } = Select;
const toOklch = converter('oklch');

// --- Funções de Formatação com Precisão ---
const formatOklchWithPrecision = (c: Oklch): string => {
  const l = (c.l * 100).toFixed(1) + '%';
  const C = c.c.toFixed(3);
  const h = c.h !== undefined ? c.h.toFixed(1) : '0';
  const alpha = c.alpha;
  if (alpha !== undefined && alpha < 1) {
    return `oklch(${l} ${C} ${h} / ${alpha.toFixed(2)})`;
  }
  return `oklch(${l} ${C} ${h})`;
};

const formatLchWithPrecision = (c: Lch): string => {
  const l = c.l.toFixed(1);
  const C = c.c.toFixed(2);
  const h = c.h !== undefined ? c.h.toFixed(1) : '0';
  const alpha = c.alpha;
  if (alpha !== undefined && alpha < 1) {
    return `lch(${l} ${C} ${h} / ${alpha.toFixed(2)})`;
  }
  return `lch(${l} ${C} ${h})`;
};

const formatLabWithPrecision = (c: Lab): string => {
  const l = c.l.toFixed(2);
  const a = c.a.toFixed(2);
  const b = c.b.toFixed(2);
  const alpha = c.alpha;
  if (alpha !== undefined && alpha < 1) {
    return `lab(${l} ${a} ${b} / ${alpha.toFixed(2)})`;
  }
  return `lab(${l} ${a} ${b})`;
};

const formatOklabWithPrecision = (c: Oklab): string => {
  const l = c.l.toFixed(3);
  const a = c.a.toFixed(3);
  const b = c.b.toFixed(3);
  const alpha = c.alpha;
  if (alpha !== undefined && alpha < 1) {
    return `oklab(${l} ${a} ${b} / ${alpha.toFixed(2)})`;
  }
  return `oklab(${l} ${a} ${b})`;
};

const formatLinearRgbWithPrecision = (c: Lrgb): string => {
  const r = c.r.toFixed(3);
  const g = c.g.toFixed(3);
  const b = c.b.toFixed(3);
  return `color(srgb-linear ${r} ${g} ${b})`;
};

const formatP3WithPrecision = (c: P3): string => {
  const r = c.r.toFixed(3);
  const g = c.g.toFixed(3);
  const b = c.b.toFixed(3);
  return `color(display-p3 ${r} ${g} ${b})`;
};

export const ColorConverter = () => {
  const { themeMode } = useThemeContext();
  const { message: messageApi } = App.useApp();
  const [inputColor, setInputColor] = useState<string>('#432dd7');
  const [color, setColor] = useState<Oklch | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('hex');

  useEffect(() => {
    try {
      const parsed = parse(inputColor);
      if (parsed) {
        setColor(toOklch(parsed));
      } else {
        setColor(toOklch('black') ?? null);
      }
    } catch {
      setColor(toOklch('black') ?? null);
    }
  }, [inputColor]);

  const handleColorChange = (value: string) => {
    setInputColor(value);
  };

  const handleColorPickerChange = (newValue: Color) => {
    const hex = newValue.toHexString();
    const parsed = parse(hex);
    if (parsed) {
      const newOklch = toOklch(parsed);
      setColor(newOklch);
      setInputColor(formatHex(newOklch));
    }
  };

  const handleSliderChange = (property: keyof Oklch, value: number) => {
    if (color) {
      const newColor = { ...color, [property]: value };
      setColor(newColor);
      setInputColor(formatHex(newColor));
    }
  };

  const outputColor = useMemo(() => {
    if (!color) return 'Formato inválido';
    try {
      switch (outputFormat) {
        case 'hex':
          return formatHex(color);
        case 'rgb':
          return formatRgb(color);
        case 'hsl':
          return formatHsl(color);
        case 'oklch':
          return formatOklchWithPrecision(color);
        case 'lch':
          return formatLchWithPrecision(converter('lch')(color));
        case 'lab':
          return formatLabWithPrecision(converter('lab')(color));
        case 'oklab':
          return formatOklabWithPrecision(converter('oklab')(color));
        case 'srgb-linear': {
          const srgbLinearConverted = converter('lrgb')(color);
          if (srgbLinearConverted) {
            return formatLinearRgbWithPrecision(srgbLinearConverted as Lrgb);
          }
          return 'Erro na conversão para Linear RGB';
        }
        case 'p3': {
          const p3Converted = converter('p3')(color);
          if (p3Converted) {
            return formatP3WithPrecision(p3Converted as P3);
          }
          return 'Erro na conversão para Figma P3';
        }
        default:
          return formatHex(color);
      }
    } catch {
      return 'Erro na conversão';
    }
  }, [color, outputFormat]);

  const selectAfter = (
    <Select
      defaultValue='hex'
      onChange={setOutputFormat}
      style={{ width: 120 }}
    >
      <Option value='hex'>HEX</Option>
      <Option value='rgb'>RGB</Option>
      <Option value='hsl'>HSL</Option>
      <Option value='oklch'>OKLCH</Option>
      <Option value='lch'>LCH</Option>
      <Option value='lab'>LAB</Option>
      <Option value='oklab'>OKLAB</Option>
      <Option value='srgb-linear'>Linear RGB</Option>
      <Option value='p3'>Figma P3</Option>
    </Select>
  );

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
              {
                title: (
                  <Link to='/' className='dark:text-shark-50'>
                    Home
                  </Link>
                ),
              },
              {
                title: (
                  <span className='dark:text-shark-50'>Conversor de Cores</span>
                ),
              },
            ]}
          />
        </div>

        <main className='container flex flex-col gap-4 mx-auto p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <Card className='md:col-span-2 lg:col-span-3 bg-white dark:bg-shark-700 border-none'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div
                  className='w-full md:w-1/2 h-48 rounded-lg mb-4 md:mb-0 transition-colors duration-300'
                  style={{
                    backgroundColor: color ? formatHex(color) : 'transparent',
                  }}
                />
                <div className='w-full md:w-1/2 flex flex-col gap-4 justify-center items-center'>
                  <span className='dark:text-shark-50'>Seletor de cores</span>
                  <ColorPicker
                    value={color ? formatHex(color) : '#000000'}
                    onChange={handleColorPickerChange}
                    disabled={!color}
                    showText
                    size='large'
                  />
                </div>
              </div>
              <div className='space-y-4 mt-4'>
                <Input
                  placeholder='#432dd7, oklch(55% 0.15 250), etc.'
                  value={inputColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  size='large'
                />
                <ConfigProvider
                  theme={{
                    components: {
                      Input: {
                        addonBg:
                          themeMode === 'dark' ? '#f6f6f6' : 'rgba(0,0,0,0.02)',
                      },
                    },
                  }}
                >
                  <Input
                    value={outputColor}
                    readOnly
                    addonAfter={selectAfter}
                    size='large'
                    onFocus={(e) => e.target.select()}
                    onClick={() => {
                      navigator.clipboard.writeText(outputColor);
                      messageApi.success(
                        'Cor copiada para a área de transferência!'
                      );
                    }}
                  />
                </ConfigProvider>
              </div>
            </Card>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
            <Card
              title={<span className='dark:text-shark-50'>Lightness</span>}
              className='bg-white dark:bg-shark-700 border-none text-shark-800 dark:text-white'
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={color?.l ?? 0}
                onChange={(v) => handleSliderChange('l', v)}
              />
            </Card>
            <Card
              title={<span className='dark:text-shark-50'>Alpha</span>}
              className='bg-white dark:bg-shark-700 border-none text-shark-800 dark:text-white'
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={color?.alpha ?? 1}
                onChange={(v) => handleSliderChange('alpha', v)}
              />
            </Card>
            <Card
              title={<span className='dark:text-shark-50'>Chroma</span>}
              className='bg-white dark:bg-shark-700 border-none text-shark-800 dark:text-white'
            >
              <Slider
                min={0}
                max={0.37}
                step={0.01}
                value={color?.c ?? 0}
                onChange={(v) => handleSliderChange('c', v)}
              />
            </Card>
            <Card
              title={<span className='dark:text-shark-50'>Hue</span>}
              className='bg-white dark:bg-shark-700 border-none text-shark-800 dark:text-white'
            >
              <Slider
                min={0}
                max={360}
                step={1}
                value={color?.h ?? 0}
                onChange={(v) => handleSliderChange('h', v)}
              />
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};
