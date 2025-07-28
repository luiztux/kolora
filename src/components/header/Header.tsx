import { ThemeSwitcherButton } from '../Components';
import { useThemeContext } from '../../contexts/Contexts';
import { Link } from 'react-router-dom';
import { logo, logoWhite } from '../../assets/Assets';

export const Header = () => {
  const { themeMode } = useThemeContext();

  return (
    <div className='flex justify-between items-center w-full px-4 py-2 border-b border-zinc-300 dark:border-zinc-50 bg-white dark:bg-shark-800'>
      <div className='inline-flex items-center gap-2'>
        <img
          src={themeMode === 'dark' ? logoWhite : logo}
          alt='Logo Kolora'
          className='max-w-10'
        />
        <Link
          to='/'
          className='text-2xl font-semibold font-gruppo dark:text-shark-50 text-shark-600'
        >
          KOLORA
        </Link>
      </div>
      <div className='inline-flex items-center gap-4'>
        <ThemeSwitcherButton />
      </div>
    </div>
  );
};
