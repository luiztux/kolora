import { App, Button, Dropdown, type MenuProps } from 'antd';
import { Link } from 'react-router-dom';
import { Blend, Download, Ellipsis, Eye, Grid3x3, PaintRoller } from 'lucide-react';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import namer from 'color-namer';

export const PaletteOptionsButton = () => {
  const { palette } = usePaletteContext();
  let primaryName = namer(palette.primary[500]).ntc[0].name;
  let grayName = namer(palette.gray[500]).ntc[0].name;
  const { message: messageApi } = App.useApp();

  primaryName = primaryName.replace(/\s/g, '-').toLowerCase();
  grayName = grayName.replace(/\s/g, '-').toLowerCase();

  const handleExport = () => {
    let content = '';
    const formatName = 'TailwindCSS v4 (CSS Variables)';

    content = `@theme {\n${Object.entries(palette.primary)
      .map(([step, color]) => `  --color-${primaryName}-${step}: ${color};`)
      .join('\n')}\n${Object.entries(palette.gray)
      .map(([step, color]) => `  --color-${grayName}-${step}: ${color};`)
      .join('\n')}\n}\n/* Use em seu CSS: var(--color-${primaryName}-500) */`;

    if (content) {
      navigator.clipboard.writeText(content);
      messageApi.success(`${formatName} copiado para a área de transferência!`);
    } else {
      messageApi.error('Erro ao gerar conteúdo para exportação.');
    }
  };

  const options: MenuProps['items'] = [
    {
      label: (
        <Link to='/contrast-grid' className='text-shark-600'>
          Contrast Grid
        </Link>
      ),
      key: 'Contrast Grid',
      icon: <Grid3x3 size={15} className='text-shark-600' />,
    },
    {
      label: (
        <Button
          ghost
          className='border-none pl-0 text-shark-600'
          onClick={handleExport}
        >
          Exportar
        </Button>
      ),
      key: 'Exportar',
      icon: <Download size={15} className='text-shark-600' />,
    },
    {
      label: (
        <Link to='/color-blind-simulation' className='text-shark-600'>
          Simulação para daltonismo
        </Link>
      ),
      key: 'Simulação para daltonismo',
      icon: <Eye size={15} className='text-shark-600' />,
    },
    {
    label: (
      <Link to='/color-wheel' className='text-shark-600'>
        Color Wheel
      </Link>
    ),
    key: 'Color Wheel',
    icon: <Blend size={15} className='text-shark-600' />,
  },
  {
    label: (
      <Link to='/gradient-generator' className='text-shark-600'>
        Gradient Generator
      </Link>
    ),
    key: 'Gradient Generator',
    icon: <PaintRoller size={15} className='text-shark-600' />,
  },
  ];

  return (
    <Dropdown menu={{ items: options }} trigger={['click']} placement='topLeft'>
      <Button
        type='text'
        icon={
          <Ellipsis size={20} className='text-shark-600 dark:text-shark-50' />
        }
        style={{ padding: 0, height: 'auto', lineHeight: 1 }}
      />
    </Dropdown>
  );
};
