"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Node,
  Edge,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// Custom Node for styling
function CustomNode({ data }: { data: any }) {
  return (
    <div className="px-5 py-3 shadow-soft rounded-2xl bg-[var(--white)] border-2 border-[var(--gray-200)] flex items-center justify-center min-w-[160px] text-center max-w-[250px] transition-all hover:-translate-y-1 hover:border-[var(--brand-blue)] group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[var(--gray-200)] border-2 border-[var(--white)] group-hover:bg-[var(--brand-blue)] transition-colors" />
      <div className="font-heading font-extrabold text-sm text-[var(--brand-blue)] uppercase tracking-wider">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[var(--gray-200)] border-2 border-[var(--white)] group-hover:bg-[var(--brand-blue)] transition-colors" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function CustomMindMap({ data }: { data: { nodes: any[]; edges: any[] } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (data?.nodes?.length > 0) {
      // Map basic groq nodes to React Flow format
      const initialNodes: Node[] = data.nodes.map((n: any, idx: number) => ({
        id: String(n.id),
        type: "custom",
        data: n.data,
        position: { x: 0, y: 0 },
      }));

      const initialEdges: Edge[] = (data.edges || []).map((e: any) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
        animated: true,
        style: { stroke: "var(--brand-blue)", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--brand-blue)",
        },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsRendered(true);
    }
  }, [data, setNodes, setEdges]);

  if (!isRendered) return <div className="p-4 text-center text-sm text-[var(--gray-500)] font-bold animate-pulse">Organizing Mind Map...</div>;

  return (
    <div className="w-full h-[400px] border-2 border-[var(--gray-200)] rounded-xl bg-[var(--gray-50)] overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="var(--gray-300)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
