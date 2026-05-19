'use client';

import React from 'react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { mockGraphNodes, mockGraphEdges } from '@/lib/mock-data';

export default function DependencyGraph() {
  const initialNodes: Node[] = mockGraphNodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: { 
      label: (
        <div className="flex flex-col items-center gap-0.5 leading-tight select-none">
          <span className="font-semibold text-white text-xs">{n.data.label}</span>
          <span className="text-[9px] text-gh-muted">⭐ {n.data.stars}</span>
        </div>
      )
    },
    style: {
      background: '#161b22',
      color: '#e6edf3',
      border: '1px solid #30363d',
      borderRadius: '6px',
      padding: '8px 12px',
      width: 110,
    },
  }));

  const initialEdges: Edge[] = mockGraphEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: e.style,
    labelStyle: { fill: '#7d8590', fontSize: 8, fontWeight: 600 },
    animated: e.label === 'DEPENDS_ON',
  }));

  return (
    <div className="w-full h-[420px] bg-gh-bg border border-gh-border rounded-md overflow-hidden relative">
      <div className="absolute top-3 left-3 z-10 bg-gh-surface/80 backdrop-blur-sm border border-gh-border px-2.5 py-1 rounded-md text-[10px] text-gh-muted select-none pointer-events-none">
        ✦ Interactive Dependency & Competition Graph
      </div>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        colorMode="dark"
      >
        <Background color="#30363d" gap={16} size={1} />
        <Controls className="!bg-gh-surface !border-gh-border !fill-white [&>button]:!border-gh-border" />
      </ReactFlow>
    </div>
  );
}
