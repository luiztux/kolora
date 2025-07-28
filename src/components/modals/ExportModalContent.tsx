import { useState, useMemo } from 'react';
import {
  Tabs,
  Input,
  Button,
  Modal,
  Select,
  Space,
  Typography,
  App,
} from 'antd';
import { ClipboardCopy } from 'lucide-react';
import { useExportPanelContext } from '../../contexts/panels/ExportPanelContext';
import {
  generateTailwindCss,
  generateCss,
  generateScssLess,
  generateJson,
  generatePaletteSvg,
} from '../../utils/exportGenerator';

const { TextArea } = Input;
const { Paragraph} = Typography;

export const ExportModalContent = () => {
  const { isExportModalOpen, paletteToExport, closeExportModal } = useExportPanelContext();
  const { message: messageApi } = App.useApp();

  const [tailwindVersion, setTailwindVersion] = useState<'v3' | 'v4'>('v4');
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl' | 'oklch'>('hex');

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    messageApi.success('Código copiado para a área de transferência!');
  };

    const renderExportBlock = (content: string, onCopy: (text: string) => void) => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <TextArea value={content} rows={10} readOnly />
      <Button
        type="primary"
        icon={<ClipboardCopy size={15} />}
        onClick={() => onCopy(content)}
        block
      >
        Copiar Código
      </Button>
    </Space>
  );

  const tailwindOutput = useMemo(() => {
    if (!paletteToExport) return '';
    return generateTailwindCss(paletteToExport, tailwindVersion, colorFormat);
  }, [paletteToExport, tailwindVersion, colorFormat]);
  

  const baseTabs = useMemo(() => {
    if (!paletteToExport) return [];

    return [
      {
        key: 'tailwind',
        label: 'Tailwind CSS',
        children: (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              value={tailwindVersion}
              onChange={(v) => setTailwindVersion(v)}
              options={[
                { value: 'v3', label: 'Tailwind CSS v3' },
                { value: 'v4', label: 'Tailwind CSS v4 (@theme)' },
              ]}
              style={{ width: '100%' }}
            />
            <Select
              value={colorFormat}
              onChange={(v) => setColorFormat(v)}
              options={[
                { value: 'hex', label: 'HEX' },
                { value: 'rgb', label: 'RGB' },
                { value: 'hsl', label: 'HSL' },
                { value: 'oklch', label: 'OKLCH' },
              ]}
              style={{ width: '100%' }}
            />
            <TextArea value={tailwindOutput} rows={10} readOnly />
            <Button
              type="primary"
              icon={<ClipboardCopy size={15} />}
              onClick={() => copyToClipboard(tailwindOutput)}
              block
            >
              Copiar Código
            </Button>
          </Space>
        ),
      },
      {
        key: 'css',
        label: 'CSS Variables',
        children: renderExportBlock(generateCss(paletteToExport), copyToClipboard),
      },
      {
        key: 'scss',
        label: 'SCSS/LESS',
        children: renderExportBlock(generateScssLess(paletteToExport), copyToClipboard),
      },
      {
        key: 'json',
        label: 'JSON',
        children: renderExportBlock(generateJson(paletteToExport), copyToClipboard),
      },
      {
        key: 'svg-figma',
        label: 'SVG/Figma',
        children: renderExportBlock(generatePaletteSvg(paletteToExport), copyToClipboard),
      },
    ];
  }, [paletteToExport, tailwindOutput, colorFormat, tailwindVersion]);



  return (
    <Modal
      open={isExportModalOpen}
      onCancel={closeExportModal}
      footer={null}
      width={720}
      centered
      title="Exportar Paleta"
    >
      {!paletteToExport ? (
        <Paragraph>Carregando...</Paragraph>
      ) : (
        <Tabs defaultActiveKey="tailwind" items={baseTabs} />
      )}
    </Modal>
  );
};
