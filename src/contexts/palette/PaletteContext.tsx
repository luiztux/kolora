import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import {
  generateTailwindPalette,
  type ColorScale,
} from '../../utils/paletteGenerator';

// Define a estrutura da nossa paleta Tailwind
export interface TailwindPalette {
  primary: ColorScale;
  gray: ColorScale;
}

// Um estado inicial para evitar que o servidor renderize algo diferente do cliente
const initialPalette: TailwindPalette = {
  primary: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
  },
  gray: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
  },
};

type PaletteContextType = {
  palette: TailwindPalette;
  generateNewPalette: () => void;
};

const PaletteContext = createContext<PaletteContextType | null>(null);

export const usePaletteContext = () => {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error('usePaletteContext must be used within a PaletteContextProvider');
  }
  return context;
};

export const PaletteContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [palette, setPalette] = useState<TailwindPalette>(initialPalette);

  // Gera a paleta inicial quando o provedor é montado
  useEffect(() => {
    setPalette(generateTailwindPalette());
  }, []);

  const generateNewPalette = () => {
    setPalette(generateTailwindPalette());
  };

  const contextValue = useMemo(
    () => ({
      palette,
      generateNewPalette,
    }),
    [palette]
  );

  return (
    <PaletteContext.Provider value={contextValue}>
      {children}
    </PaletteContext.Provider>
  );
};
