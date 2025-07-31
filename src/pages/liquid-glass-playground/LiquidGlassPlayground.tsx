import { useState, useEffect } from 'react';
import { Button, Breadcrumb, Slider, Row, Col, Select } from 'antd';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import { GeneralOptionsButton, Header } from '../../components/Components';
import { getContrastingTextColor } from '../../utils/paletteGenerator';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

// Utility to convert hex to a usable RGB object
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null; // Return null for invalid hex formats
};

export const LiquidGlassPlayground = () => {
  const { palette, generateNewPalette } = usePaletteContext();
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0.5);
  const [saturation, setSaturation] = useState(120);
  const [effect, setEffect] = useState('linear');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        generateNewPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNewPalette]);

  const previewBackgroundColor = palette.primary[500] || '#1a73e8';
  const cardTextColor = getContrastingTextColor(palette.gray[100] || '#f1f3f4');

  // --- Adaptive Effect Colors ---
  const effectBaseColor = getContrastingTextColor(previewBackgroundColor);
  const effectRgb = hexToRgb(effectBaseColor);
  const isBackgroundLight = effectBaseColor === '#000000';

  // Parallax motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const offsetX = e.clientX - innerWidth / 2;
      const offsetY = e.clientY - innerHeight / 2;
      x.set(offsetX / 20);
      y.set(offsetY / 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  /** Renders the extra visual effect layer */
  const renderEffectLayer = () => {
    if (!effectRgb) return null; // Don't render if the base color is invalid

    switch (effect) {
      case 'linear':
        return (
          <motion.div
            key={effect} // Force re-mount on effect change
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
        // Use vibrant colors from the palette for the wave effect
        const waveColor1 = palette.primary[400] || 'rgba(0, 255, 255, 0.5)';
        const waveColor2 = palette.primary[600] || 'rgba(255, 0, 255, 0.5)';
        return (
          <motion.div
            key={effect} // Force re-mount on effect change
            animate={{ backgroundPositionX: ['0%', '200%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle at 50% 50%, ${waveColor1} 0%, ${waveColor2} 60%)`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '200px 200px',
              mixBlendMode: isBackgroundLight ? 'multiply' : 'screen', // Adapt blend mode
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
            key={effect} // Force re-mount on effect change
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
            {/* Controls Panel */}
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
              </div>
            </Col>

            {/* Preview with Liquid Glass effect */}
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
    </>
  );
};
