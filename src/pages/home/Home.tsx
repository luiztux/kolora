import { useEffect, useMemo } from 'react';
import {
  Header,
  MenuPanel,
  ExportModalContent,
  PaletteOptionsButton,
} from '../../components/Components';
import { getContrastingTextColor } from '../../utils/paletteGenerator';
import { RefreshCw } from 'lucide-react';
import {
  Button,
  message,
  ConfigProvider,
  Card,
  Alert,
  Input,
  Avatar,
  Radio,
  Space,
  Switch,
  Slider,
  Progress,
  Tag,
  Badge,
  Spin
} from 'antd';
import { usePaletteContext } from '../../contexts/palette/PaletteContext';
import namer from 'color-namer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type TailwindStep =
  | '50' | '100' | '200' | '300' | '400'
  | '500' | '600' | '700' | '800' | '900';

type ColorScale = Record<TailwindStep, string>;

// Componente para renderizar uma única linha de escala de cores
const ColorScaleRow = ({ title, scale }: { title: string; scale: ColorScale }) => {
  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    message.success(`Cor ${color.toUpperCase()} copiada!`);
  };

  return (
    <div>
      <h3 className='text-lg font-semibold mb-2' style={{ color: scale[800] }}>
        {title}
      </h3>
      <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3'>
        {Object.entries(scale).map(([step, color]) => {
          const textColor = getContrastingTextColor(color as string);
          return (
            <div
              key={step}
              className="rounded-lg shadow-inner p-2 cursor-pointer transition-transform hover:scale-[1.03] active:scale-95"
              style={{ backgroundColor: color as string }}
              onClick={() => handleCopyColor(color as string)}
            >
              <span className="block text-xs font-bold" style={{ color: textColor }}>
                {step}
              </span>
              <span className="block font-mono text-xs opacity-80" style={{ color: textColor }}>
                {color as string}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const data = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Fev', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Abr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Mai', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

export const Home = () => {
  const { palette, generateNewPalette } = usePaletteContext();
  const primaryName = namer(palette.primary[500]).ntc[0].name;
  const grayName = namer(palette.gray[500]).ntc[0].name;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        generateNewPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [generateNewPalette]);

  // Cria um tema dinâmico para o Ant Design sempre que a paleta mudar
  const antdTheme = useMemo(() => ({
    token: {
      colorPrimary: palette.primary[500],
      colorWarning: palette.primary[500],
      colorText: palette.gray[900],
      colorTextSecondary: palette.gray[600],
      colorBgContainer: palette.gray[100],
      colorBgLayout: palette.gray[50],
      colorBorder: palette.gray[300],
      colorSuccess: palette.primary[500],
      colorInfo: palette.primary[500],
      colorError: palette.primary[500],
    },
    components: {
      Card: {
        colorBgContainer: palette.gray[100],
        headerBg: 'transparent',
      },
      Alert: {
        colorInfoBg: palette.primary[100],
        colorInfoBorder: palette.primary[300],
        colorInfo: palette.primary[700],
      },
      Button: {
        colorPrimary: palette.primary[500],
        colorPrimaryHover: palette.primary[600],
        colorPrimaryActive: palette.primary[700],
      },
      Radio: {
        colorPrimary: palette.primary[500],
      },
      Switch: {
        colorPrimary: palette.primary[500],
      },
      Slider: {
        colorPrimary: palette.primary[500],
        colorPrimaryBorderHover: palette.primary[500],
        colorPrimaryHover: palette.primary[500],
      },
      Progress: {
        colorPrimary: palette.primary[500],
      },
      Tag: {
        colorPrimary: palette.primary[500],
      },
      Badge: {
        colorPrimary: palette.primary[500],
      },
      Spin: {
        colorPrimary: palette.primary[500],
      },
      Table: {
        headerBg: palette.gray[200],
        headerColor: palette.gray[900],
        rowHoverBg: palette.gray[100],
      },
      Pagination: {
        colorPrimary: palette.primary[500],
      },
      DatePicker: {
        colorPrimary: palette.primary[500],
      },
      TimePicker: {
        colorPrimary: palette.primary[500],
      },
      Upload: {
        colorPrimary: palette.primary[500],
      },
      Rate: {
        colorPrimary: palette.primary[500],
      },
      Steps: {
        colorPrimary: palette.primary[500],
      },
      Timeline: {
        colorPrimary: palette.primary[500],
      },
      Tree: {
        colorPrimary: palette.primary[500],
      },
      Transfer: {
        colorPrimary: palette.primary[500],
      },
      Mentions: {
        colorPrimary: palette.primary[500],
      },
      Cascader: {
        colorPrimary: palette.primary[500],
      },
      TreeSelect: {
        colorPrimary: palette.primary[500],
      },
      InputNumber: {
        colorPrimary: palette.primary[500],
      },
      AutoComplete: {
        colorPrimary: palette.primary[500],
      },
      Checkbox: {
        colorPrimary: palette.primary[500],
      },
      Select: {
        colorPrimary: palette.primary[500],
      },
      Form: {
        colorPrimary: palette.primary[500],
      },
      List: {
        colorPrimary: palette.primary[500],
      },
      Descriptions: {
        colorPrimary: palette.primary[500],
      },
      Statistic: {
        colorPrimary: palette.primary[500],
      },
      Calendar: {
        colorPrimary: palette.primary[500],
      },
      Carousel: {
        colorPrimary: palette.primary[500],
      },
      Collapse: {
        colorPrimary: palette.primary[500],
      },
      Tabs: {
        colorPrimary: palette.primary[500],
      },
      Tooltip: {
        colorPrimary: palette.primary[500],
      },
      Popover: {
        colorPrimary: palette.primary[500],
      },
      Popconfirm: {
        colorPrimary: palette.primary[500],
      },
      Modal: {
        colorPrimary: palette.primary[500],
      },
      Drawer: {
        colorPrimary: palette.primary[500],
      },
      Result: {
        colorPrimary: palette.primary[500],
      },
      Empty: {
        colorPrimary: palette.primary[500],
      },
      Skeleton: {
        colorPrimary: palette.primary[500],
      },
      Image: {
        colorPrimary: palette.primary[500],
      },
      Divider: {
        colorPrimary: palette.primary[500],
      },
      Typography: {
        colorPrimary: palette.primary[500],
      },
      Layout: {
        colorPrimary: palette.primary[500],
      },
      Menu: {
        colorPrimary: palette.primary[500],
      },
      Breadcrumb: {
        colorPrimary: palette.primary[500],
      },
      Dropdown: {
        colorPrimary: palette.primary[500],
      },
    },
  }), [palette]);

  return (
    <>
      <MenuPanel />
      <ExportModalContent />
      <div className='sticky top-0 z-50 bg-white dark:bg-shark-800 shadow-sm w-full'>
        <Header />
      </div>
      <div
        className='min-h-screen transition-colors duration-500 dark:bg-shark-800 overflow-x-hidden'
        style={{ backgroundColor: palette.gray[50] }}
      >
        <header className='container mx-auto px-4 py-12 md:py-20 text-center overflow-x-hidden'>
          <div className='my-4'>
            <h1
              className='text-4xl md:text-5xl font-bold pb-6 dark:text-shark-50'
              style={{ color: palette.gray[900] }}
            >
              Crie paletas personalizadas para Tailwind em segundos
            </h1>
          </div>
          <p
            className='text-lg md:text-xl mb-8 max-w-3xl mx-auto dark:text-shark-50'
            style={{ color: palette.gray[600] }}
          >
            Pressione a tecla <strong>Espaço</strong> ou clique no botão para
            gerar uma nova paleta. Copie as cores e use no seu projeto
            TailwindCSS com facilidade.
          </p>
          <Button
            type='primary'
            size='large'
            icon={<RefreshCw size={20} />}
            onClick={generateNewPalette}
            style={{
              backgroundColor: palette.primary[500],
              color: getContrastingTextColor(palette.primary[500]),
            }}
          >
            Gerar Nova Paleta
          </Button>
        </header>

        <main className='container mx-auto px-4'>
          <div>
            <PaletteOptionsButton />
          </div>
          <div
            className='p-6 rounded-xl shadow-lg transition-colors duration-500 mb-8'
            style={{ backgroundColor: palette.gray[100] }}
          >
            <div className='space-y-6'>
              <ColorScaleRow title={primaryName} scale={palette.primary} />
              <ColorScaleRow title={grayName} scale={palette.gray} />
            </div>
          </div>

          {/* Seção: Previews de Componentes */}
          <section className='mb-8'>
            <h2
              className='text-3xl font-bold mb-6 text-center dark:text-shark-50'
              style={{ color: palette.gray[900] }}
            >
              Veja suas cores em ação
            </h2>
            <ConfigProvider theme={antdTheme}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Exemplo de Botões */}
                <Card title="Botões">
                  <div className='flex flex-wrap gap-4'>
                    <Button type="primary">Botão Primário</Button>
                    <Button>Botão Padrão</Button>
                    <Button type="dashed">Botão Tracejado</Button>
                  </div>
                </Card>

                {/* Exemplo de Card */}
                <Card title="Card de Exemplo">
                  <p>Este é um exemplo de card estilizado com sua paleta.</p>
                  <p>O texto e o fundo se adaptam às cores.</p>
                </Card>

                {/* Exemplo de Alerta */}
                <Card title="Alerta">
                  <Alert
                    message="Informação Importante"
                    description="Este é um alerta usando as cores da sua paleta."
                    type="info"
                    showIcon
                  />
                </Card>

                {/* Exemplo de Input (apenas para demonstração de cor de borda/foco) */}
                <Card title="Input">
                  <Input placeholder="Digite algo aqui" />
                </Card>

                {/* Novos Componentes Ant Design */}
                <Card title="Avatar">
                  <Space size={16}>
                    <Avatar style={{ backgroundColor: palette.primary[500] }}>U</Avatar>
                    <Avatar style={{ backgroundColor: palette.primary[300] }}>K</Avatar>
                    <Avatar style={{ backgroundColor: palette.primary[700] }}>L</Avatar>
                  </Space>
                </Card>

                <Card title="Radio Buttons">
                  <Radio.Group defaultValue="a">
                    <Radio.Button value="a">Opção A</Radio.Button>
                    <Radio.Button value="b">Opção B</Radio.Button>
                    <Radio.Button value="c">Opção C</Radio.Button>
                  </Radio.Group>
                </Card>

                <Card title="Switch">
                  <Switch defaultChecked />
                </Card>

                <Card title="Slider">
                  <Slider defaultValue={30} style={{ width: '100%' }} />
                </Card>

                <Card title="Progress Bar">
                  <Progress percent={50} status="active" />
                </Card>

                <Card title="Tags">
                  <Space size={[0, 8]}>
                    <Tag color={palette.primary[500]}>Tag Primária</Tag>
                    <Tag color={palette.gray[500]}>Tag Cinza</Tag>
                  </Space>
                </Card>

                <Card title="Badge">
                  <Badge count={5} style={{ backgroundColor: palette.primary[500] }}>
                    <Avatar shape="square" size="large" />
                  </Badge>
                </Card>

                <Card title="Spin (Loading)">
                  <Spin size="large" />
                </Card>

                {/* Gráficos Recharts */}
                <Card title="Gráfico de Linhas">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="pv" stroke={palette.primary[500]} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="uv" stroke={palette.gray[500]} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="Gráfico de Barras">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="pv" fill={palette.primary[500]} />
                      <Bar dataKey="uv" fill={palette.gray[500]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="Gráfico de Área">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="uv" stroke={palette.primary[500]} fill={palette.primary[100]} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="Gráfico de Pizza">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[{ name: 'Grupo A', value: 400 }, { name: 'Grupo B', value: 300 }, { name: 'Grupo C', value: 300 }, { name: 'Grupo D', value: 200 }]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill={palette.primary[500]} />
                        <Cell fill={palette.primary[300]} />
                        <Cell fill={palette.gray[500]} />
                        <Cell fill={palette.gray[300]} />
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </ConfigProvider>
          </section>
        </main>

        <footer
          className='text-center py-12 dark:text-shark-50'
          style={{ color: palette.gray[500] }}
        >
          <p>Feito com 💜 para a comunidade open source.</p>
        </footer>
      </div>
    </>
  );
};
