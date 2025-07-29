import { Button, Dropdown, type MenuProps } from 'antd';
import { Link } from 'react-router-dom';
import { Blend, Download, Ellipsis, Eye, Grid3x3, PaintRoller } from 'lucide-react';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import { useExportPanelContext } from '../../contexts/panels/ExportPanelContext';
import namer from 'color-namer';
import type { ColorScale } from '../../utils/paletteGenerator';

interface PaletteOptionsButtonProps {
  palette?: {
    primary: ColorScale;
    gray: ColorScale;
  };
}

export const PaletteOptionsButton = ({ palette: paletteFromProp }: PaletteOptionsButtonProps) => {
  const { palette: paletteFromContext } = usePaletteContext();
  const { openExportModal } = useExportPanelContext();

  const palette = paletteFromProp || paletteFromContext;

  let primaryName = namer(palette.primary[500]).ntc[0].name;
  let grayName = namer(palette.gray[500]).ntc[0].name;

  primaryName = primaryName.replace(/\s/g, '-').toLowerCase();
  grayName = grayName.replace(/\s/g, '-').toLowerCase();

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
          onClick={() => openExportModal({...palette})}
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