import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Node,
  Edge,
  useNodesInitialized,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BookGraph } from '../Model';

interface GraphProps {
  graph: BookGraph;
}

const GraphContent: React.FC<GraphProps> = ({ graph }) => {
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  React.useEffect(() => {
    if (nodesInitialized) {
      fitView({ padding: 0.2 });
    }
  }, [nodesInitialized, fitView]);

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node, index) => {
        // Create a circular layout
        const angle = (index / graph.nodes.length) * 2 * Math.PI;
        const radius = Math.max(300, graph.nodes.length * 30);
        return {
          id: node.id,
          data: { label: node.name },
          position: {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          },
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '14px',
            width: 180,
            textAlign: 'center' as const,
          },
        };
      }),
    [graph.nodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        style: {
          stroke: '#666',
          strokeWidth: Math.max(1, Math.min(edge.weight / 20, 5)),
        },
        type: 'smoothstep',
        animated: true,
      })),
    [graph.edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      className="bg-gray-90"
    >
      <Background color="#333" gap={16} />
    </ReactFlow>
  );
};

const Graph: React.FC<GraphProps> = ({ graph }) => {
  return (
    <div className="w-full h-full min-h-[600px]">
      <ReactFlowProvider>
        <GraphContent graph={graph} />
      </ReactFlowProvider>
    </div>
  );
};

export default Graph;
