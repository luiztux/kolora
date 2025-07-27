import { BrowserRouter } from 'react-router-dom';
import {
  MenuContextProvider,
  ThemeContextProvider,
  PaletteContextProvider,
} from './contexts/Contexts';
import { Router } from './routes/Router';
import { App as AntdApp } from 'antd';

export const App = () => {
  return (
    <BrowserRouter basename='/kolora'>
      <ThemeContextProvider>
        <PaletteContextProvider>
          <MenuContextProvider>
            <AntdApp>
              <Router />
            </AntdApp>
          </MenuContextProvider>
        </PaletteContextProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  );
};
