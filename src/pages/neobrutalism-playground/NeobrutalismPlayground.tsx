import React, { useState, useMemo, useCallback, type CSSProperties } from 'react';
import { App, Button, Breadcrumb, Modal, Slider, Tabs, type TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import { RefreshCw, User, Check, Download } from 'lucide-react';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import { GeneralOptionsButton, Header } from '../../components/Components';
import { getContrastingTextColor } from '../../utils/paletteGenerator';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --------------------
// 🔹 Tipagens Genéricas
// --------------------
interface NeoBaseProps {
  className?: string;
  style?: CSSProperties;
}

interface NeoButtonProps extends NeoBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {}
interface NeoCardProps extends NeoBaseProps, React.HTMLAttributes<HTMLDivElement> {}
interface NeoInputProps extends NeoBaseProps, React.InputHTMLAttributes<HTMLInputElement> {}

interface NeoToggleProps extends NeoBaseProps {
  isOn: boolean;
  onToggle: () => void;
  knobColor?: string;
}

interface NeoCheckboxProps extends NeoBaseProps {
  isChecked: boolean;
  onToggle: () => void;
}

interface NeoProgressBarProps extends NeoBaseProps {
  progress: number;
  barStyle?: CSSProperties;
}

interface NeoTabsProps extends NeoBaseProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  activeColor?: string;
  inactiveColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

// --------------------
// 🔹 Componentes Neo
// --------------------
const NeoButton = React.memo<NeoButtonProps>(({ children, className = '', style, ...props }) => (
  <button
    {...props}
    className={`px-6 py-3 font-bold border-2 transition-all duration-200 ease-in-out cursor-pointer ${className}`}
    style={{
      ...style,
      borderWidth: 'var(--neo-border-width, 2px)',
      borderRadius: 'var(--neo-border-radius, 0px)',
      boxShadow: `var(--neo-shadow-offset, 4px) var(--neo-shadow-offset, 4px) 0px var(--neo-shadow-color, black)`,
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = `translate(var(--neo-shadow-offset, 4px), var(--neo-shadow-offset, 4px))`;
      e.currentTarget.style.boxShadow = 'none';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = 'translate(0, 0)';
      e.currentTarget.style.boxShadow = `var(--neo-shadow-offset, 4px) var(--neo-shadow-offset, 4px) 0px var(--neo-shadow-color, black)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translate(0, 0)';
      e.currentTarget.style.boxShadow = `var(--neo-shadow-offset, 4px) var(--neo-shadow-offset, 4px) 0px var(--neo-shadow-color, black)`;
    }}
  >
    {children}
  </button>
));

const NeoCard = React.memo<NeoCardProps>(({ children, className = '', style, ...props }) => (
  <div
    {...props}
    className={`p-6 ${className}`}
    style={{
      ...style,
      borderWidth: 'var(--neo-border-width, 2px)',
      borderRadius: 'var(--neo-border-radius, 0px)',
      boxShadow: `calc(var(--neo-shadow-offset, 4px) * 2) calc(var(--neo-shadow-offset, 4px) * 2) 0px var(--neo-shadow-color, black)`,
    }}
  >
    {children}
  </div>
));

const NeoInput = React.memo<NeoInputProps>(({ className = '', style, ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-3 focus:outline-none ${className}`}
    style={{
      ...style,
      borderWidth: 'var(--neo-border-width, 2px)',
      borderRadius: 'var(--neo-border-radius, 0px)',
    }}
  />
));

const NeoToggle = React.memo<NeoToggleProps>(({ isOn, onToggle, className = '', style, knobColor }) => (
  <button
    onClick={onToggle}
    className={`w-20 h-10 p-1 transition-colors duration-300 ${className}`}
    style={{
      ...style,
      borderWidth: 'var(--neo-border-width, 2px)',
      borderRadius: 'var(--neo-border-radius, 0px)',
      boxShadow: `var(--neo-shadow-offset, 4px) var(--neo-shadow-offset, 4px) 0px var(--neo-shadow-color, black)`,
    }}
  >
    <div
      className='w-8 h-8 transition-transform duration-300 ease-in-out'
      style={{
        transform: isOn ? 'translateX(100%)' : 'translateX(0)',
        backgroundColor: knobColor,
        borderRadius: 'calc(var(--neo-border-radius, 0px) * 0.5)',
      }}
    />
  </button>
));

const NeoCheckbox = React.memo<NeoCheckboxProps>(({ isChecked, onToggle, className = '', style }) => (
  <button
    onClick={onToggle}
    className={`w-8 h-8 flex items-center justify-center transition-colors duration-200 ${className}`}
    style={{
      ...style,
      borderWidth: 'var(--neo-border-width, 2px)',
      borderRadius: 'var(--neo-border-radius, 0px)',
    }}
  >
    {isChecked && <Check size={24} />}
  </button>
));

const NeoProgressBar = React.memo<NeoProgressBarProps>(({ progress, className = '', style, barStyle }) => (
  <div
    className={`w-full h-8 p-1 ${className}`}
    style={{
      ...style,
      borderWidth: 'var(--neo-border-width, 2px)',
      borderRadius: 'var(--neo-border-radius, 0px)',
    }}
  >
    <div className='h-full' style={{ width: `${progress}%`, ...barStyle }} />
  </div>
));

const NeoTabs = React.memo<NeoTabsProps>(({ tabs, activeTab, onTabChange, className = '', style, activeColor, inactiveColor, activeTextColor, inactiveTextColor }) => (
  <div className={`flex border-b-2 ${className}`} style={{ ...style, borderWidth: 'var(--neo-border-width, 2px)' }}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className='px-4 py-2 font-bold border-r-2'
          style={{
            borderWidth: 'var(--neo-border-width, 2px)',
            backgroundColor: isActive ? activeColor : inactiveColor,
            color: isActive ? activeTextColor : inactiveTextColor,
            transform: isActive ? 'translateY(calc(var(--neo-border-width, 2px) * 1))' : 'none',
            borderBottom: isActive ? 'none' : `var(--neo-border-width, 2px) solid var(--neo-shadow-color, black)`,
          }}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
));

// --------------------
// 🔹 Componente Principal
// --------------------
export const NeobrutalismPlayground: React.FC = () => {
  const { palette, generateNewPalette } = usePaletteContext();

  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [progress, setProgress] = useState(60);
  const [activeTab, setActiveTab] = useState('tab1');
  const [borderWidth, setBorderWidth] = useState(2);
  const [shadowOffset, setShadowOffset] = useState(4);
  const [borderRadius, setBorderRadius] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { message: messageApi } = App.useApp();

  // Paleta
  const primaryColor = palette.primary[500];
  const secondaryColor = palette.primary[200];
  const alertColor = palette.primary[100];
  const backgroundColor = palette.gray[100];
  const textColor = getContrastingTextColor(backgroundColor);
  const borderColor = getContrastingTextColor(backgroundColor);

  // Variáveis de estilo
  const neoStyles = useMemo<CSSProperties>(() => ({
    '--neo-border-width': `${borderWidth}px`,
    '--neo-shadow-offset': `${shadowOffset}px`,
    '--neo-border-radius': `${borderRadius}px`,
    '--neo-shadow-color': borderColor,
  }) as CSSProperties, [borderWidth, shadowOffset, borderRadius, borderColor]);

  // Tabs
  const tabs = useMemo(() => [
    { key: 'tab1', label: 'Profile' },
    { key: 'tab2', label: 'Dashboard' },
    { key: 'tab3', label: 'Settings' },
  ], []);

  // Callbacks
  const handleToggle = useCallback(() => setIsToggleOn((prev) => !prev), []);
  const handleCheckbox = useCallback(() => setIsChecked((prev) => !prev), []);

const codeSnippets = useMemo(() => ({
  cssVariables: `
:root {
  --neo-border-width: ${borderWidth}px;
  --neo-shadow-offset: ${shadowOffset}px;
  --neo-border-radius: ${borderRadius}px;
  --neo-shadow-color: ${borderColor};
}
  `,
  plainCss: `
.neo-btn {
  border-width: ${borderWidth}px;
  border-radius: ${borderRadius}px;
  box-shadow: ${shadowOffset}px ${shadowOffset}px 0px ${borderColor};
}

.neo-card {
  border-width: ${borderWidth}px;
  border-radius: ${borderRadius}px;
  box-shadow: ${shadowOffset * 2}px ${shadowOffset * 2}px 0px ${borderColor};
}
  `,
  json: JSON.stringify({
    neoBorderWidth: `${borderWidth}px`,
    neoShadowOffset: `${shadowOffset}px`,
    neoBorderRadius: `${borderRadius}px`,
    neoShadowColor: borderColor,
  }, null, 2),
  tailwindV3: `
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addComponents }) {
  addComponents({
    '.neo-btn': {
      borderWidth: '${borderWidth}px',
      borderRadius: '${borderRadius}px',
      boxShadow: '${shadowOffset}px ${shadowOffset}px 0px ${borderColor}',
    },
    '.neo-card': {
      borderWidth: '${borderWidth}px',
      borderRadius: '${borderRadius}px',
      boxShadow: '${shadowOffset * 2}px ${shadowOffset * 2}px 0px ${borderColor}',
    },
  });
});
  `,
  tailwindV4: `
import plugin from 'tailwindcss/plugin'

export default {
  theme: {
    extend: {
      boxShadow: {
        neo: '${shadowOffset}px ${shadowOffset}px 0px ${borderColor}',
        'neo-card': '${shadowOffset * 2}px ${shadowOffset * 2}px 0px ${borderColor}',
      },
      borderRadius: {
        neo: '${borderRadius}px',
      },
      borderWidth: {
        neo: '${borderWidth}px',
      }
    }
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.neo-btn': {
          boxShadow: '${shadowOffset}px ${shadowOffset}px 0px ${borderColor}',
          borderWidth: '${borderWidth}px',
          borderRadius: '${borderRadius}px',
        },
        '.neo-card': {
          boxShadow: '${shadowOffset * 2}px ${shadowOffset * 2}px 0px ${borderColor}',
          borderWidth: '${borderWidth}px',
          borderRadius: '${borderRadius}px',
        },
      })
    })
  ]
}
  `
}), [borderWidth, shadowOffset, borderRadius, borderColor]);


const handleCopyToClipboard = useCallback((code: string) => {
  navigator.clipboard.writeText(code)
    .then(() => {
      messageApi.success('Código copiado para a área de transferência!');
    })
    .catch(() => {
      messageApi.error('Erro ao copiar o código.');
    });
}, []);


// Mapeia automaticamente para criar tabs com o highlight correto
  const tabItems: TabsProps['items'] = useMemo(() => [
    { key: 'cssVariables', label: 'CSS Variables', lang: 'css', code: codeSnippets.cssVariables },
    { key: 'plainCss', label: 'Plain CSS', lang: 'css', code: codeSnippets.plainCss },
    { key: 'json', label: 'JSON', lang: 'json', code: codeSnippets.json },
    { key: 'tailwindV3', label: 'Tailwind v3', lang: 'javascript', code: codeSnippets.tailwindV3 },
    { key: 'tailwindV4', label: 'Tailwind v4', lang: 'javascript', code: codeSnippets.tailwindV4 },
  ].map(item => ({
    key: item.key,
    label: item.label,
    children: (
      <>
        <SyntaxHighlighter language={item.lang} style={vscDarkPlus}>
          {item.code.trim()}
        </SyntaxHighlighter>
        <Button className="mt-4" onClick={() => handleCopyToClipboard(item.code)}>
          Copiar código
        </Button>
      </>
    ),
  })), [codeSnippets, handleCopyToClipboard]);


  return (
    <>
      <GeneralOptionsButton />
      <div className='min-h-screen' style={{ backgroundColor, color: textColor, ...neoStyles }}>
        <div className='sticky top-0 z-50 shadow-sm' style={{ backgroundColor }}>
          <Header />
        </div>

        <div className='px-4 my-4'>
          <Breadcrumb
            items={[
              { title: <Link to='/' style={{ color: textColor }}>Home</Link> },
              { title: <span style={{ color: textColor }}>Neobrutalism Playground</span> },
            ]}
          />
        </div>

        <main className='container px-4 py-8'>
          <div className='flex flex-col md:flex-row justify-between items-center mb-10'>
            <h1 className='text-3xl text-center font-semibold mb-6 dark:text-shark-50'>Neobrutalism Playground</h1>
            <Button
              type='primary'
              size='large'
              icon={<RefreshCw size={20} />}
              onClick={generateNewPalette}
              style={{ backgroundColor: primaryColor, color: getContrastingTextColor(primaryColor) }}
            >
              Gerar Nova Paleta
            </Button>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 items-start'>
            {/* 🔹 Controls */}
            <div className='lg:col-span-1 flex flex-col gap-8 p-6 border-2' style={{ borderColor }}>
              <h2 className='text-2xl font-bold'>Controles</h2>
              {[
                { label: 'Border Width', value: borderWidth, setter: setBorderWidth, min: 1, max: 8, unit: 'px' },
                { label: 'Shadow Offset', value: shadowOffset, setter: setShadowOffset, min: 2, max: 12, unit: 'px' },
                { label: 'Border Radius', value: borderRadius, setter: setBorderRadius, min: 0, max: 16, unit: 'px' },
                { label: 'Progress Bar', value: progress, setter: setProgress, min: 0, max: 100, unit: '%' },
              ].map(({ label, value, setter, min, max, unit }) => (
                <div key={label}>
                  <label className='font-semibold block mb-2'>{label}: {value}{unit}</label>
                  <Slider min={min} max={max} value={value} onChange={setter} />
                </div>
              ))}
              <Button type='default' icon={<Download size={16} />} onClick={() => setIsModalVisible(true)}>Exportar</Button>
            </div>

            {/* 🔹 Components Preview */}
            <div className='lg:col-span-2 flex flex-col gap-8'>
              <NeoTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className='border-b-2'
                style={{ borderColor }}
                activeColor={palette.gray[50]}
                inactiveColor='transparent'
                activeTextColor={textColor}
                inactiveTextColor={textColor}
              />

              <NeoCard
                style={{ backgroundColor: palette.gray[50], borderColor, marginTop: '-2rem' }}
              >
                <h3 className='text-2xl font-bold mb-4'>Card</h3>
                <p className='mb-4'>
                  Card que demonstra o estilo neobrutalism. Ela usa cores sólidas, bordas bem definidas e uma sombra forte e deslocada.
                </p>
                <div className='flex flex-col gap-4'>
                  <NeoInput
                    placeholder='Enter your name...'
                    style={{ backgroundColor: palette.gray[100], color: getContrastingTextColor(palette.gray[100]), borderColor }}
                  />
                  <div className='flex items-center gap-4'>
                    <NeoCheckbox
                      isChecked={isChecked}
                      onToggle={handleCheckbox}
                      style={{ backgroundColor: isChecked ? primaryColor : 'transparent', color: getContrastingTextColor(primaryColor), borderColor }}
                    />
                    <label>I agree to the terms</label>
                  </div>
                  <NeoButton
                    className='w-full'
                    style={{ backgroundColor: primaryColor, color: getContrastingTextColor(primaryColor), borderColor }}
                  >
                    Submit
                  </NeoButton>
                </div>
              </NeoCard>

              <div className='p-4 border-2 font-semibold'
                   style={{ backgroundColor: alertColor, color: getContrastingTextColor(alertColor), borderColor }}>
                Esta é uma mensagem de alerta. Use-a para transmitir informações importantes.
              </div>

              <NeoProgressBar
                progress={progress}
                style={{ borderColor }}
                barStyle={{ backgroundColor: primaryColor }}
              />

              <div className='flex flex-wrap items-center gap-4'>
                <span className='px-3 py-1 border-2 text-sm font-bold'
                      style={{ backgroundColor: primaryColor, color: getContrastingTextColor(primaryColor), borderColor }}>
                  Active
                </span>
                <span className='px-3 py-1 border-2 text-sm font-bold'
                      style={{ backgroundColor: palette.gray[400], color: getContrastingTextColor(palette.gray[400]), borderColor }}>
                  Inactive
                </span>
              </div>

              <div className='flex items-center gap-4'>
                <div className='w-20 h-20 border-2 rounded-full flex items-center justify-center'
                     style={{ backgroundColor: secondaryColor, color: getContrastingTextColor(secondaryColor), borderColor, boxShadow: `var(--neo-shadow-offset, 4px) var(--neo-shadow-offset, 4px) 0px var(--neo-shadow-color, black)` }}>
                  <User size={32} />
                </div>
                <p className='font-bold'>User Avatar</p>
              </div>

              <div className='flex items-center gap-4'>
                <NeoToggle
                  isOn={isToggleOn}
                  onToggle={handleToggle}
                  style={{ backgroundColor: isToggleOn ? primaryColor : palette.gray[200], borderColor }}
                  knobColor={getContrastingTextColor(isToggleOn ? primaryColor : palette.gray[200])}
                />
                <p className='font-bold'>Feature Toggle</p>
              </div>
            </div>
          </div>
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
