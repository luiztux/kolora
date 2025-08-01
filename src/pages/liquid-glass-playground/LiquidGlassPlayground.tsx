import { useState, useEffect, useMemo } from 'react';
import {
  App,
  Button,
  Breadcrumb,
  Slider,
  Row,
  Col,
  Select,
  Modal,
  Tabs,
  type TabsProps,
} from 'antd';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  usePaletteContext,
  type TailwindPalette,
} from '../../contexts/palette/PaletteContext';
import { GeneralOptionsButton, Header } from '../../components/Components';
import {
  getContrastingTextColor,
  type ColorScale,
} from '../../utils/paletteGenerator';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw, Download } from 'lucide-react';

interface PaletteInterface {
  palette: TailwindPalette;
}

// ---------- UTILS ----------
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// ---------- EXTRA COMPONENTS ----------
export const PalettePreview = ({ palette }: PaletteInterface) => {
  const colorGroups = Object.entries(palette) as [string, ColorScale][];
  const { message: messageApi } = App.useApp();

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    messageApi.success(`Color ${color.toUpperCase()} copied!`);
  };

  return (
    <div className='flex flex-col gap-4 mt-4'>
      {colorGroups.map(([name, scale]) => (
        <div key={name}>
          <h4 className='font-semibold text-sm capitalize mb-2 dark:text-shark-50'>
            {name}
          </h4>
          <div className='flex gap-2'>
            {Object.values(scale).map((color, i) => (
              <div
                key={i}
                className='w-12 h-12 rounded-md shadow-md flex items-center justify-center text-[10px] font-mono cursor-pointer'
                style={{
                  backgroundColor: color,
                  color: getContrastingTextColor(color as string),
                }}
                onClick={() => handleCopyColor(color as string)}
              >
                {(color as string).replace('#', '')}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- MAIN COMPONENT ----------
export const LiquidGlassPlayground = () => {
  const { palette, generateNewPalette } = usePaletteContext();
  const { message: messageApi } = App.useApp();
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0.5);
  const [saturation, setSaturation] = useState(120);
  const [effect, setEffect] = useState('linear');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const previewBackgroundColor = palette.primary[500] || '#1a73e8';
  const cardTextColor = getContrastingTextColor(palette.gray[100] || '#f1f3f4');
  const effectBaseColor = getContrastingTextColor(previewBackgroundColor);
  const effectRgb = hexToRgb(effectBaseColor);
  const isBackgroundLight = effectBaseColor === '#000000';

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      x.set((e.clientX - innerWidth / 2) / 20);
      y.set((e.clientY - innerHeight / 2) / 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  const renderEffectLayer = () => {
    if (!effectRgb) return null;
    switch (effect) {
      case 'linear':
        return (
          <motion.div
            key={effect}
            animate={{ x: ['-150%', '150%'] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '200%',
              background: `linear-gradient(120deg, rgba(${effectRgb.r},${effectRgb.g},${effectRgb.b},0.35) 0%, rgba(${effectRgb.r},${effectRgb.g},${effectRgb.b},0) 60%)`,
              transform: 'rotate(25deg)',
            }}
          />
        );

      case 'wave': {
        const waveColor1 = palette.primary[400] || 'rgba(0, 255, 255, 0.5)';
        const waveColor2 = palette.primary[600] || 'rgba(255, 0, 255, 0.5)';
        return (
          <motion.div
            key={effect}
            animate={{ backgroundPositionX: ['0%', '200%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle at 50% 50%, ${waveColor1} 0%, ${waveColor2} 60%)`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '200px 200px',
              mixBlendMode: isBackgroundLight ? 'multiply' : 'screen',
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            }}
          />
        );
      }

      case 'aurora':
        return (
          <motion.div
            key={effect}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(130deg, rgba(0,255,255,0.3) 0%, rgba(255,0,255,0.3) 40%, rgba(255,255,0,0.3) 80%)',
              backgroundSize: '200% 200%',
              mixBlendMode: isBackgroundLight ? 'multiply' : 'screen',
            }}
          />
        );

      case 'particles':
        return Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [Math.random() * 300, Math.random() * 300],
              y: [Math.random() * 200, Math.random() * 200],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              position: 'absolute',
              width: 15,
              height: 15,
              borderRadius: '50%',
              background: `rgba(${effectRgb.r},${effectRgb.g},${effectRgb.b},0.4)`,
              boxShadow: `0 0 10px rgba(${effectRgb.r},${effectRgb.g},${effectRgb.b},0.6)`,
              top: Math.random() * 100,
              left: Math.random() * 200,
            }}
          />
        ));

      default:
        return null;
    }
  };

  const codeSnippets = useMemo(
    () => ({
      cssVariables: `
:root {
  --glass-blur: ${blur}px;
  --glass-opacity: ${opacity.toFixed(2)};
  --glass-saturation: ${saturation}%;
}

.your-element {
  background: rgba(255, 255, 255, var(--glass-opacity));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  border: 1px solid rgba(255, 255, 255, 0.2);
}
    `,
      plainCss: `
.liquid-glass-effect {
  background: rgba(255, 255, 255, ${opacity.toFixed(2)});
  backdrop-filter: blur(${blur}px) saturate(${saturation}%);
  -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
    `,
      jsObject: `
const glassStyle = {
  background: 'rgba(255, 255, 255, ${opacity.toFixed(2)})',
  backdropFilter: 'blur(${blur}px) saturate(${saturation}%)',
  WebkitBackdropFilter: 'blur(${blur}px) saturate(${saturation}%)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};
    `,
    }),
    [blur, opacity, saturation]
  );

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.trim());
    messageApi.success('Código copiado');
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'CSS Variables',
      label: 'CSS Variables',
      children: (
        <>
          <SyntaxHighlighter language='css' style={vscDarkPlus}>
            {codeSnippets.cssVariables.trim()}
          </SyntaxHighlighter>
          <Button
            className='mt-4'
            onClick={() => handleCopyToClipboard(codeSnippets.cssVariables)}
          >
            Copiar código
          </Button>
        </>
      ),
    },
    {
      key: 'Plain CSS',
      label: 'Plain CSS',
      children: (
        <>
          <SyntaxHighlighter language='css' style={vscDarkPlus}>
            {codeSnippets.plainCss.trim()}
          </SyntaxHighlighter>
          <Button
            className='mt-4'
            onClick={() => handleCopyToClipboard(codeSnippets.plainCss)}
          >
            Copiar código
          </Button>
        </>
      ),
    },
    {
      key: 'JSON',
      label: 'JSON',
      children: (
        <>
          <SyntaxHighlighter language='javascript' style={vscDarkPlus}>
            {codeSnippets.jsObject.trim()}
          </SyntaxHighlighter>
          <Button
            className='mt-4'
            onClick={() => handleCopyToClipboard(codeSnippets.jsObject)}
          >
            Copiar código
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <GeneralOptionsButton />
      <div className='min-h-screen bg-gray-100 dark:bg-shark-800 relative'>
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
                  <span className='dark:text-shark-50'>
                    Liquid Glass Playground
                  </span>
                ),
              },
            ]}
          />
        </div>
        <main className='container px-4 py-8'>
          <div className='flex justify-between items-center mb-10'>
            <h1 className='text-3xl font-semibold mb-6 dark:text-shark-50'>
              Liquid Glass Playground
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
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div className='flex flex-col gap-6'>
                <div>
                  <label className='font-semibold block mb-2 dark:text-shark-200'>
                    Blur: {blur}px
                  </label>
                  <Slider
                    min={0}
                    max={40}
                    step={1}
                    value={blur}
                    onChange={setBlur}
                  />
                </div>
                <div>
                  <label className='font-semibold block mb-2 dark:text-shark-200'>
                    Opacity: {opacity.toFixed(2)}
                  </label>
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={opacity}
                    onChange={setOpacity}
                  />
                </div>
                <div>
                  <label className='font-semibold block mb-2 dark:text-shark-200'>
                    Saturation: {saturation}%
                  </label>
                  <Slider
                    min={0}
                    max={200}
                    step={5}
                    value={saturation}
                    onChange={setSaturation}
                  />
                </div>
                <div>
                  <label className='font-semibold block mb-2 dark:text-shark-200'>
                    Visual Effect
                  </label>
                  <Select
                    value={effect}
                    onChange={setEffect}
                    className='w-1/3'
                    options={[
                      { label: 'Linear Reflex', value: 'linear' },
                      { label: 'Wave', value: 'wave' },
                      { label: 'Aurora', value: 'aurora' },
                      { label: 'Particles', value: 'particles' },
                    ]}
                  />
                </div>
                <Button
                  type='default'
                  icon={<Download size={16} />}
                  onClick={() => setIsModalVisible(true)}
                >
                  Exportar efeito
                </Button>
                <PalettePreview palette={palette} />
              </div>
            </Col>
            {/* Preview com Liquid Glass */}
            <Col xs={24} md={12}>
              <div
                className='h-96 rounded-lg flex items-center justify-center p-8'
                style={{ backgroundColor: previewBackgroundColor }}
              >
                <motion.div
                  style={{
                    perspective: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <motion.div
                    style={{
                      rotateX,
                      rotateY,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      style={{
                        width: 300,
                        height: 200,
                        color: cardTextColor,
                        background: `rgba(255, 255, 255, ${opacity})`,
                        backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 20,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                      }}
                    >
                      {renderEffectLayer()}
                      <div className='relative z-10 p-4'>
                        <h3 className='text-xl font-bold text-liquid-glass'>
                          Liquid Glass
                        </h3>
                        <p className='text-liquid-glass'>
                          Movimente o mouse e ajuste os sliders!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </Col>
          </Row>
        </main>
      </div>
      <Modal
        title='Export Glassmorphism Effect'
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Tabs defaultActiveKey='1' items={tabItems} />
      </Modal>
    </>
  );
};
