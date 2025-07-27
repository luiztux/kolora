import { Button, Dropdown, type MenuProps, App } from 'antd';
import { Ellipsis } from 'lucide-react';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';

const downloadOptions: MenuProps['items'] = [
  {
    label: (
      <Button ghost className='border-none pl-0 text-shark-600'>
        Exportar JSON
      </Button>
    ),
    key: 'export-json',
  },
  {
    label: (
      <Button ghost className='border-none pl-0 text-shark-600'>
        Exportar TailwindCSS (v3)
      </Button>
    ),
    key: 'export-tailwind-v3',
  },
  {
    label: (
      <Button ghost className='border-none pl-0 text-shark-600'>
        Exportar TailwindCSS (v4)
      </Button>
    ),
    key: 'export-tailwind-v4',
  },
  {
    label: (
      <Button ghost className='border-none pl-0 text-shark-600'>
        Exportar SCSS/LESS
      </Button>
    ),
    key: 'export-scss-less',
  },
];

export const ColorWheelExportButton = () => {
  const { palette } = usePaletteContext();
  const { message: messageApi } = App.useApp();

  const handleExport = (key: string) => {
    let content = '';
    let formatName = '';

    switch (key) {
      case 'export-json':
        content = JSON.stringify(palette, null, 2);
        formatName = 'JSON';
        break;
      case 'export-tailwind-v3':
        // Lógica para TailwindCSS v3
        content = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n          ${Object.entries(palette.primary).map(([step, color]) => `${step}: '${color}',`).join('\n          ')}\n        },\n        gray: {\n          ${Object.entries(palette.gray).map(([step, color]) => `${step}: '${color}',`).join('\n          ')}\n        },\n      },\n    },\n  },\n};`;
        formatName = 'TailwindCSS v3';
        break;
      case 'export-tailwind-v4':
        // Lógica para TailwindCSS v4 (mais simples, pois usa variáveis CSS)
        content = `@theme {\n${Object.entries(palette.primary).map(([step, color]) => `  --color-primary-${step}: ${color};`).join('\n')}\n${Object.entries(palette.gray).map(([step, color]) => `  --color-gray-${step}: ${color};`).join('\n')}\n}\n/* Use em seu CSS: var(--color-primary-500) */`;
        formatName = 'TailwindCSS v4 (CSS Variables)';
        break;
      case 'export-scss-less':
        // Lógica para SCSS/LESS
        content = `$primary: (\n${Object.entries(palette.primary).map(([step, color]) => `  ${step}: '${color}',`).join('\n')}\n);\n\n$gray: (\n${Object.entries(palette.gray).map(([step, color]) => `  ${step}: '${color}',`).join('\n')}\n);\n\n// Exemplo de uso: color: map-get($primary, 500);`;
        formatName = 'SCSS/LESS';
        break;
      default:
        break;
    }

    if (content) {
      navigator.clipboard.writeText(content);
      messageApi.success(`${formatName} copiado para a área de transferência!`);
    } else {
      messageApi.error('Erro ao gerar conteúdo para exportação.');
    }
  };

  const handleMenuClick = (e: any) => {
    handleExport(e.key);
  };

  return (
    <Dropdown
      menu={{ items: downloadOptions, onClick: handleMenuClick }}
      trigger={['click']}
      placement='topLeft'
    >
      <Button
        type='text'
        icon={
          <Ellipsis size={20} className='text-shark-600 dark:text-shark-50' />
        }
        style={{ padding: 0, height: 'auto', lineHeight: 1 }}
      />
    </Dropdown>
  );
};