import { BrowserRouter } from 'react-router-dom';
import {
  ExportPanelProvider,
  MenuContextProvider,
  ThemeContextProvider,
  PaletteContextProvider,
} from './contexts/Contexts';
import { Router } from './routes/Router';
import { App as AntdApp, ConfigProvider } from 'antd';

import locale from 'antd/locale/pt_BR';

export const App = () => {
  return (
    <BrowserRouter>
      <ConfigProvider
        locale={locale}
        theme={{
          token: {
            colorPrimary: '#432dd7',
          },
        }}
      >
        <ThemeContextProvider>
          <PaletteContextProvider>
            <MenuContextProvider>
              <ExportPanelProvider>
                <AntdApp>
                  <Router />
                </AntdApp>
              </ExportPanelProvider>
            </MenuContextProvider>
          </PaletteContextProvider>
        </ThemeContextProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
};
