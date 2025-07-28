import {
  createContext,
  useState,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { type ColorScale } from '../../utils/paletteGenerator';

// Define a estrutura da paleta exportável
export interface ExportablePalette {
  primary: ColorScale;
  gray: ColorScale;
}

// Define o formato do contexto
type ExportPanelContextType = {
  isExportModalOpen: boolean;
  openExportModal: (palette: ExportablePalette) => void;
  closeExportModal: () => void;
  paletteToExport: ExportablePalette | null;
};

// Cria o contexto
const ExportPanelContext = createContext<ExportPanelContextType | undefined>(undefined);

// Hook customizado
export const useExportPanelContext = () => {
  const context = useContext(ExportPanelContext);
  if (!context) {
    throw new Error('useExportPanelContext must be used within an ExportPanelProvider');
  }
  return context;
};

// Provedor do contexto
export const ExportPanelProvider = ({ children }: { children: ReactNode }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [paletteToExport, setPaletteToExport] = useState<ExportablePalette | null>(null);

  const openExportModal = (palette: ExportablePalette) => {
    setPaletteToExport(palette);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
    setPaletteToExport(null);
  };

  const contextValue = useMemo(
    () => ({
      isExportModalOpen,
      openExportModal,
      closeExportModal,
      paletteToExport,
    }),
    [isExportModalOpen, paletteToExport]
  );

  return (
    <ExportPanelContext.Provider value={contextValue}>
      {children}
    </ExportPanelContext.Provider>
  );
};
