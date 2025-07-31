import {
  Home,
  ContrastGrid,
  ColorBlindSimulation,
  ColorWheelPage,
  GradientGenerator,
  ColorConverter,
  LiquidGlassPlayground,
} from './Pages';

type PagesRouterType = {
  element: React.ReactElement;
  path: string;
  title: string;
};

export const pagesRouter: PagesRouterType[] = [
  {
    element: <Home />,
    path: '/',
    title: 'Home',
  },
  {
    element: <ContrastGrid />,
    path: '/contrast-grid',
    title: 'Contrast Grid',
  },
  {
    element: <ColorBlindSimulation />,
    path: '/color-blind-simulation',
    title: 'Color Blindness Simulation',
  },
  {
    element: <ColorWheelPage />,
    path: '/color-wheel',
    title: 'Color Wheel',
  },
  {
    element: <GradientGenerator />,
    path: '/gradient-generator',
    title: 'Gradient Generator',
  },
  {
    element: <ColorConverter />,
    path: '/color-converter',
    title: 'Color Converter',
  },
  {
    element: <LiquidGlassPlayground />,
    path: '/liquid-glass-playground',
    title: 'Liquid Glass Playground',
  },
];
