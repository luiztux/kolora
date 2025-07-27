import { Menu } from 'lucide-react';
import { Button } from 'antd';
import { useMenuContext } from '../../contexts/Contexts';

export const MenuButton = () => {
  const { toggleOpenMenu } = useMenuContext();

  return (
    <Button
      ghost
      className='border-none'
      icon={<Menu size={15} className='text-shark-600 dark:text-shark-50' />}
      onClick={toggleOpenMenu}
    />
  );
};
