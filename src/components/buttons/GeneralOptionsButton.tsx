import { FloatButton, message } from 'antd';
import {
  Brush,
  Grid3x3,
  Eye,
  Blend,
  House,
  PaintRoller,
  Layers,
  SwatchBook
} from 'lucide-react';
import { usePaletteContext } from '../../contexts/Contexts';
import { useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';


// Hook de longpress.
const useLongPress = (
  onLongPress: () => void,
  onClick?: () => void,
  delay = 500
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `useCallback` previne que as funções sejam recriadas em cada renderização.
  const start = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      timeoutRef.current = null; // Marca que o long press foi ativado.
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handlePressEnd = useCallback(() => {
    // Se o timeout ainda existir, o long press não foi ativado, então é um clique.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      onClick?.();
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseUp: handlePressEnd,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: handlePressEnd,
    onTouchMove: clear,
  };
};

// Componente para cada item do menu, encapsulando a lógica de long press.
const OptionButton = ({
  option,
  isMobile,
}: {
  option: any;
  isMobile: boolean;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (option.action) {
      option.action();
    } else if (option.href) {
      navigate(option.href);
    }
  };

  const longPressHandlers = useLongPress(
    () => message.info(option.label),
    handleClick
  );

  const commonProps = {
    icon: option.icon,
  };

  if (isMobile) {
    // No mobile, o hook gerencia o clique e o long press.
    // O `href` não é passado para não interferir com os eventos do hook.
    return <FloatButton {...commonProps} {...longPressHandlers} />;
  }

  // No desktop, usamos o comportamento padrão com tooltip, mas o clique
  // ainda é gerenciado pelo `handleClick` para respeitar o `basename`.
  return (
    <FloatButton
      {...commonProps}
      onClick={handleClick} // Usa o mesmo handler do mobile
      tooltip={{
        title: option.label,
        placement: 'left',
      }}
    />
  );
};

export const GeneralOptionsButton = () => {
  const { generateNewPalette } = usePaletteContext();
  const isMobile = useMediaQuery({ query: '(max-width: 48rem)'})

  const options = useMemo(
    () => [
      {
        icon: <Brush size={15} className='text-shark-600' />,
        label: 'Gerar Paleta',
        action: generateNewPalette,
      },
      {
        icon: <SwatchBook size={15} className='text-shark-600' />,
        label: 'Conversor de Cores',
        href: '/color-converter',
      },
      {
        icon: <PaintRoller size={15} className='text-shark-600' />,
        label: 'Gradient Generator',
        href: '/gradient-generator',
      },
      {
        icon: <PaintRoller size={15} className='text-shark-600' />,
        label: 'Color Converter',
        href: '/color-converter',
      },
      {
        icon: <Blend size={15} className='text-shark-600' />,
        label: 'Color Wheel',
        href: '/color-wheel',
      },
      {
        icon: <Eye size={15} className='text-shark-600' />,
        label: 'Simulação para daltonismo',
        href: '/color-blind-simulation',
      },
      {
        icon: <Grid3x3 size={15} className='text-shark-600' />,
        label: 'Contrast Grid',
        href: '/contrast-grid',
      },
      {
        icon: <House size={15} className='text-shark-600' />,
        label: 'Home',
        href: '/',
      },
    ],
    [generateNewPalette]
  );

  return (
    <FloatButton.Group
      trigger='click'
      icon={<Layers size={20} />}
      tooltip={{ title: 'Ações globais', placement: 'left' }}
      type='primary'
    >
      {options.map((opt, idx) => (
        <OptionButton key={idx} option={opt} isMobile={isMobile} />
      ))}
      {isMobile && <FloatButton.BackTop visibilityHeight={0} />}
    </FloatButton.Group>
  );
};
