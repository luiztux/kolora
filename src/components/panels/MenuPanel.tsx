import { Drawer, Menu, type MenuProps } from 'antd';
import { useMenuContext } from '../../contexts/Contexts';
import { Link } from 'react-router-dom';
import { Grid3x3, Eye, Blend, House, PaintRoller } from 'lucide-react';

const options: MenuProps['items'] = [
  {
    label: (
      <Link to='/' className='text-shark-600'>
        Home
      </Link>
    ),
    key: 'Home',
    icon: <House size={15} className='text-shark-600' />,
  },
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

export const MenuPanel = () => {
  const { openMenu, toggleOpenMenu } = useMenuContext();

  return (
    <Drawer open={openMenu} onClose={toggleOpenMenu}>
      <Menu mode='inline' items={options} />
    </Drawer>
  );
};
