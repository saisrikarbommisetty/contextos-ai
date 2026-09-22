import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Layers, 
  CheckCircle2, 
  GitCommit, 
  FileText, 
  Users, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  X,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { ContextGraphData, GraphNode, GraphEdge } from '../../types';
import { projectApi } from '../../services/api';
import { LoadingState } from '../common/LoadingState';

interface ContextGraphTabProps {
  projectId: string;
}

export const ContextGraphTab: React.FC<ContextGraphTabProps> = ({ projectId }) => {
  const [graphData, setGraphData] = useState<ContextGraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const data = await projectApi.getContextGraph(projectId);
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load context graph:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [projectId]);

  if (loading) {
    return <LoadingState message="Reconstructing context relationship network..." isContextReconstructing={true} />;
  }

  if (!graphData || graphData.nodes.length === 0) {
    return <div className="p-12 text-center text-slate-400 text-xs">No graph nodes available.</div>;
  }

  const filteredNodes = graphData.nodes.filter((node) => {
    if (filterType === 'ALL') return true;
    return node.type === filterType;
  });

  // Calculate layout coordinates in a circular radial layout around project center
  const width = 800;
  const height = 540;
  const centerX = width / 2;
  const centerY = height / 2;

  const projectNode = graphData.nodes.find((n) => n.type === 'PROJECT') || graphData.nodes[0];
  const otherNodes = filteredNodes.filter((n) => n.id !== projectNode?.id);

  const nodePositions = new Map<string, { x: number; y: number }>();
  if (projectNode) {
    nodePositions.set(projectNode.id, { x: centerX, y: centerY });
  }

  // Position nodes radially grouped by type
  const typeGroups: Record<string, GraphNode[]> = {
    DECISION: [],
    TASK: [],
    DOCUMENT: [],
    MEETING: [],
    PERSON: [],
  };

  otherNodes.forEach((n) => {
    if (typeGroups[n.type]) {
      typeGroups[n.type].push(n);
    } else {
      typeGroups.TASK.push(n);
    }
  });

  const totalOther = otherNodes.length;
  otherNodes.forEach((node, index) => {
    const angle = (index / (totalOther || 1)) * 2 * Math.PI - Math.PI / 2;
    // Layer radius
    let radius = 180;
    if (node.type === 'DECISION') radius = 160;
    else if (node.type === 'TASK') radius = 210;
    else if (node.type === 'DOCUMENT') radius = 200;
    else if (node.type === 'MEETING') radius = 170;
    else if (node.type === 'PERSON') radius = 140;

    nodePositions.set(node.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  });

  const getNodeColor = (type: GraphNode['type'], status?: string) => {
    if (status === 'BLOCKED') return { fill: '#ef4444', stroke: '#f87171', bg: 'bg-rose-500/20 text-rose-300' };
    switch (type) {
      case 'PROJECT':
        return { fill: '#6366f1', stroke: '#818cf8', bg: 'bg-brand-500/20 text-brand-300' };
      case 'DECISION':
        return { fill: '#a855f7', stroke: '#c084fc', bg: 'bg-purple-500/20 text-purple-300' };
      case 'TASK':
        return { fill: '#06b6d4', stroke: '#22d3ee', bg: 'bg-cyan-500/20 text-cyan-300' };
      case 'DOCUMENT':
        return { fill: '#3b82f6', stroke: '#60a5fa', bg: 'bg-blue-500/20 text-blue-300' };
      case 'MEETING':
        return { fill: '#10b981', stroke: '#34d399', bg: 'bg-emerald-500/20 text-emerald-300' };
      case 'PERSON':
        return { fill: '#f59e0b', stroke: '#fbbf24', bg: 'bg-amber-500/20 text-amber-300' };
      default:
        return { fill: '#64748b', stroke: '#94a3b8', bg: 'bg-slate-500/20 text-slate-300' };
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-border">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accent-cyan" />
            <span>Context Graph Visualizer</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time map connecting decisions, tasks, documents, and contributors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'TASK', 'DECISION', 'DOCUMENT', 'MEETING', 'PERSON'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === t
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-surface-100 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative rounded-2xl glass-card border border-border overflow-hidden bg-surface-300 min-h-[560px] flex items-center justify-center select-none">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-surface-200/90 border border-border p-1.5 rounded-xl backdrop-blur-md">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-surface-200/90 border border-border px-3 py-2 rounded-xl text-[11px] text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
            <span>Project</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Decision</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Document</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Blocked</span>
          </div>
        </div>

        {/* Interactive SVG Network */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-w-[860px] cursor-grab active:cursor-grabbing transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Grid Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Render Edges */}
          {graphData.edges.map((edge) => {
            const p1 = nodePositions.get(edge.source);
            const p2 = nodePositions.get(edge.target);
            if (!p1 || !p2) return null;

            const isBlockedEdge = edge.type === 'BLOCKER';
            const isHighlighted = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

            return (
              <g key={edge.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={
                    isHighlighted
                      ? '#818cf8'
                      : isBlockedEdge
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(99, 102, 241, 0.2)'
                  }
                  strokeWidth={isHighlighted ? 2.5 : isBlockedEdge ? 2 : 1.2}
                  strokeDasharray={isBlockedEdge ? '4 4' : undefined}
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {filteredNodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const isProject = node.type === 'PROJECT';
            const isSelected = selectedNode?.id === node.id;
            const colors = getNodeColor(node.type, node.status);
            const radius = isProject ? 36 : 22;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Glow ring on hover/selected */}
                <circle
                  r={radius + (isSelected ? 8 : 4)}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 3 : 1}
                  opacity={isSelected ? 0.8 : 0.2}
                  className="transition-all"
                />

                {/* Node Circle */}
                <circle
                  r={radius}
                  fill="#131722"
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Node Inner Fill */}
                <circle
                  r={radius - 4}
                  fill={colors.fill}
                  opacity={0.25}
                />

                {/* Node Label Text */}
                <text
                  textAnchor="middle"
                  dy={isProject ? 5 : 4}
                  fill="#ffffff"
                  fontSize={isProject ? 11 : 9}
                  fontWeight={isProject ? '700' : '600'}
                  className="pointer-events-none select-none"
                >
                  {isProject ? 'CampusConnect' : node.type.substring(0, 4)}
                </text>

                {/* Subtitle floating below */}
                <text
                  textAnchor="middle"
                  dy={radius + 14}
                  fill="#94a3b8"
                  fontSize={8.5}
                  fontWeight="500"
                  className="pointer-events-none select-none max-w-[100px]"
                >
                  {node.label.length > 20 ? `${node.label.substring(0, 18)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Slide-Out Drawer */}
        {selectedNode && (
          <div className="absolute top-4 left-4 z-20 w-80 rounded-2xl glass-panel border border-brand-500/40 p-5 shadow-2xl backdrop-blur-xl animate-float-in">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase ${getNodeColor(selectedNode.type, selectedNode.status).bg}`}>
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-white mb-2 leading-snug">
              {selectedNode.label}
            </h4>

            {selectedNode.subtitle && (
              <p className="text-xs text-brand-300 font-medium mb-3">
                {selectedNode.subtitle}
              </p>
            )}

            {selectedNode.details && (
              <div className="space-y-2 pt-2 border-t border-border/60 text-xs text-slate-300">
                {selectedNode.details.description && (
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {selectedNode.details.description}
                  </p>
                )}
                {selectedNode.details.assignee && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Assignee:</span>
                    <span className="text-slate-200 font-semibold">{selectedNode.details.assignee}</span>
                  </div>
                )}
                {selectedNode.details.status && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-mono text-brand-300">{selectedNode.details.status}</span>
                  </div>
                )}
                {selectedNode.details.madeBy && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Decided by:</span>
                    <span className="text-slate-200 font-semibold">{selectedNode.details.madeBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
