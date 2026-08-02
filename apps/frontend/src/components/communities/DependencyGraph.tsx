'use client';

import React from 'react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function DependencyGraph() {
  const initialNodes: Node[] = [
    {
      id: '1',
      position: { x: 250, y: 50 },
      data: { 
        label: (
          <div className="flex flex-col items-center gap-0.5 leading-tight select-none">
            <span className="font-semibold text-white text-xs">Core App</span>
            <span className="text-[9px] text-gh-muted">⭐ 100</span>
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
    }
  ];

  const initialEdges: Edge[] = [];

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
