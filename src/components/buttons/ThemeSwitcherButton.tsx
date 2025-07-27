import { ConfigProvider, Switch } from 'antd';
import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../../contexts/Contexts';

export const ThemeSwitcherButton = () => {
  const { themeMode, toggleTheme } = useThemeContext();

  return (
    <ConfigProvider
      theme={{
        components: {
          Switch: {
            handleBg: themeMode === 'dark' ? '#232323' : '#888888',
            handleSize: 15,
          },
        },
      }}
    >
      <Switch
        checkedChildren={
          <Sun size={16} className='text-yellow-600 mt-[0.125rem]' />
        }
        unCheckedChildren={
          <Moon size={16} className='text-yellow-600 -mt-1' />
        }
        checked={themeMode === 'dark'}
        onChange={toggleTheme}
        className='bg-white dark:bg-shark-700 border border-zinc-300'
      />
    </ConfigProvider>
  );
};
