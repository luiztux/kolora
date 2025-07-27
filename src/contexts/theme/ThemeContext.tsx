import React, { useState, useEffect, useMemo } from 'react';

// Tipo para o tema, para evitar repetição
type Theme = 'light' | 'dark';

type ThemeContextType = {
  themeMode: Theme;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextType | null>(null);

export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

// Função auxiliar para obter o tema inicial de forma segura e síncrona
const getInitialTheme = (): Theme => {
  // 1. Tenta obter do localStorage
  const storedTheme = localStorage.getItem('kolora-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  // 2. Se não houver no localStorage, usa a preferência do sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  // O estado é inicializado de forma síncrona, evitando o "flash" de tema.
  const [themeMode, setThemeMode] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const rootElement = window.document.documentElement;

    // Remove a classe antiga e adiciona a nova
    rootElement.classList.remove(themeMode === 'light' ? 'dark' : 'light');
    rootElement.classList.add(themeMode);
    

    // Salva a preferência atual no localStorage a cada mudança
    localStorage.setItem('kolora-theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const contextValue = useMemo(
    () => ({
      themeMode,
      toggleTheme,
    }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};