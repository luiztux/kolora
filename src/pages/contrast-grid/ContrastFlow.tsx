import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import { wcagContrast, parse } from 'culori';
import { getContrastingTextColor } from '../../utils/paletteGenerator';
import { Tooltip, Empty } from 'antd';
import colorNamer from 'color-namer';
import dagre from 'dagre';

import '@xyflow/react/dist/style.css';

// --- funções utilitárias ---
const getWCAGCompliance = (ratio: number) => {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
};

// Sanitiza sequências de cores para serem usadas como IDs HTML válidas
const sanitizeColorId = (color: string) => 
  color.replace(/#/g, 'hex').replace(/[^a-zA-Z0-9]/g, '_');

// Função para calcular layout usando Dagre
const getLayoutedElements = (
  nodes: ColorNode[], 
  edges: Edge[], 
  direction = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configuração do layout
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 150, // Espaçamento horizontal entre nós
    ranksep: 200, // Espaçamento vertical entre níveis
    marginx: 50,
    marginy: 50,
  });

  // Adiciona nós ao grafo Dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 120, height: 120 });
  });

  // Adiciona edges ao grafo Dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calcula o layout
  dagre.layout(dagreGraph);

  // Aplica as posições calculadas aos nós
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 60, // Centraliza o nó (width/2)
        y: nodeWithPosition.y - 60, // Centraliza o nó (height/2)
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- definições de tipagem ---
interface ColorNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  accessiblePairs: { color: string; ratio: number }[];
}

// Tipo para o nó completo
type ColorNode = Node<ColorNodeData>;


const ColorNodeComponent = ({ data }: NodeProps<ColorNode>) => {
  const colorName = useMemo(() => {
    try {
      return colorNamer(data.color).html[0].name;
    } catch {
      return 'Unknown Color';
    }
  }, [data.color]);

  const tooltipContent = (
    <div>
      <p className='font-bold text-lg'>{data.label}</p>
      <p className='mb-2'>{colorName}</p>
      {data.accessiblePairs.length > 0 && (
        <div>
          <p className='font-semibold'>Accessible contrast with:</p>
          <ul className='list-disc list-inside'>
            {data.accessiblePairs.map((item) => (
              <li key={item.color}>
                <span style={{ color: item.color }} className='font-bold'>
                  {item.color.toUpperCase()}
                </span>{' '}
                ({item.ratio.toFixed(2)}:1)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement='right'>
      <div
        style={{
          backgroundColor: data.color,
          color: getContrastingTextColor(data.color),
          border: '2px solid',
          borderColor: getContrastingTextColor(data.color),
          borderRadius: '50%',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Handles para conexões */}
        <Handle
          type="source"
          position={Position.Top}
          style={{ background: 'transparent', border: 'none' }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          style={{ background: 'transparent', border: 'none' }}
        />
        <Handle
          type="source"
          position={Position.Left}
          style={{ background: 'transparent', border: 'none' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          style={{ background: 'transparent', border: 'none' }}
        />
        {data.label}
      </div>
    </Tooltip>
  );
};


const nodeTypes = {
  colorNode: ColorNodeComponent,
} as const;


interface ContrastFlowProps {
  allColors: string[];
}

export const ContrastFlow = ({ allColors }: ContrastFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as ColorNode[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  useEffect(() => {
    const accessiblePairs: {
      colorA: string;
      colorB: string;
      ratio: number;
      compliance: 'AA' | 'AAA';
    }[] = [];

    // Calcula pares acessíveis
    for (let i = 0; i < allColors.length; i++) {
      for (let j = i + 1; j < allColors.length; j++) {
        const colorA = allColors[i];
        const colorB = allColors[j];
        const parsedA = parse(colorA);
        const parsedB = parse(colorB);

        if (parsedA && parsedB) {
          const ratio = wcagContrast(parsedA, parsedB);
          const compliance = getWCAGCompliance(ratio);
          if (compliance === 'AA' || compliance === 'AAA') {
            accessiblePairs.push({ colorA, colorB, ratio, compliance });
          }
        }
      }
    }

    if (accessiblePairs.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Mapeia pares acessíveis para cada cor
    const colorMap = new Map<string, { color: string; ratio: number }[]>();
    accessiblePairs.forEach(({ colorA, colorB, ratio }) => {
      if (!colorMap.has(colorA)) colorMap.set(colorA, []);
      if (!colorMap.has(colorB)) colorMap.set(colorB, []);
      colorMap.get(colorA)!.push({ color: colorB, ratio });
      colorMap.get(colorB)!.push({ color: colorA, ratio });
    });

    // Filtra apenas cores que têm pelo menos uma conexão
    const connectedColors = Array.from(colorMap.keys()).filter(
      color => colorMap.get(color)!.length > 0
    );

    // Encontra componentes conectados usando DFS
    const visited = new Set<string>();
    const components: string[][] = [];

    const dfs = (color: string, component: string[]) => {
      visited.add(color);
      component.push(color);
      
      const neighbors = colorMap.get(color) || [];
      neighbors.forEach(({ color: neighborColor }) => {
        if (!visited.has(neighborColor) && connectedColors.includes(neighborColor)) {
          dfs(neighborColor, component);
        }
      });
    };

    // Encontra todos os componentes conectados
    connectedColors.forEach(color => {
      if (!visited.has(color)) {
        const component: string[] = [];
        dfs(color, component);
        if (component.length > 1) { // Apenas componentes com mais de 1 nó
          components.push(component);
        }
      }
    });

    // Se não há componentes conectados, mostra mensagem
    if (components.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Usa apenas as cores dos maiores componentes conectados
    // Distribui os nós considerando múltiplos componentes
    let allCalculatedNodes: ColorNode[] = [];
    let allCalculatedEdges: Edge[] = [];
    let globalYOffset = 0;

    components.forEach((component) => {
      // Cria nós temporários para este componente (posições serão calculadas pelo Dagre)
      const componentNodes: ColorNode[] = component.map((color) => ({
        id: sanitizeColorId(color),
        type: 'colorNode',
        position: { x: 0, y: 0 }, // Posição temporária
        data: {
          label: color.toUpperCase(),
          color: color,
          accessiblePairs: colorMap.get(color) || [],
        },
      }));

      // Cria edges para este componente
      const nodeIds = new Set(componentNodes.map(node => node.id));
      const componentEdges: Edge[] = accessiblePairs
        .filter(({ colorA, colorB }) => {
          const sourceId = sanitizeColorId(colorA);
          const targetId = sanitizeColorId(colorB);
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
        })
        .map(({ colorA, colorB, ratio, compliance }) => {
          const isAAA = compliance === 'AAA';
          const sourceId = sanitizeColorId(colorA);
          const targetId = sanitizeColorId(colorB);
          
          return {
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            label: `${ratio.toFixed(2)}:1`,
            labelStyle: { fontWeight: 'bold', fontSize: 14 },
            style: {
              stroke: isAAA ? '#22c55e' : '#eab308',
              strokeWidth: isAAA ? 4 : 2,
            },
            animated: isAAA,
          };
        });

      // Aplica layout do Dagre para este componente
      const { nodes: layoutedNodes } = getLayoutedElements(
        componentNodes, 
        componentEdges,
        'TB' // Top to Bottom
      );

      // Ajusta posições Y para evitar sobreposição entre componentes
      const adjustedNodes = layoutedNodes.map(node => ({
        ...node,
        position: {
          x: node.position.x,
          y: node.position.y + globalYOffset,
        },
      }));

      // Calcula altura deste componente para o próximo offset
      const maxY = Math.max(...adjustedNodes.map(node => node.position.y));
      const minY = Math.min(...adjustedNodes.map(node => node.position.y));
      const componentHeight = maxY - minY + 200; // 200px de margem entre componentes

      globalYOffset += componentHeight;

      allCalculatedNodes = [...allCalculatedNodes, ...adjustedNodes];
      allCalculatedEdges = [...allCalculatedEdges, ...componentEdges];
    });

    // Aplica os nós e edges com layout calculado pelo Dagre
    setNodes(allCalculatedNodes);
    setEdges(allCalculatedEdges);
  }, [allColors, setNodes, setEdges]);

  if (nodes.length === 0) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Empty description='Nenhum par de cores com contraste acessível foi encontrado nesta paleta.' />
      </div>
    );
  }

  return (
    <div
      style={{ height: '80vh', width: '100%' }}
      className='rounded-lg overflow-hidden shadow-lg dark:bg-shark-900'
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};