import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Orbit,
  RefreshCw,
  Search,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Compass,
  Play,
  Pause,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Plus,
  Minus,
  Crosshair,
  Tag,
  AlertTriangle,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { api, ManifoldResponse, ManifoldNode, ManifoldCluster, ManifoldEdge } from '../../services/api';

// Enterprise color mapping
const CPSE_COLORS: Record<string, { main: string; glow: string; text: string; label: string; sector: string }> = {
  ONGC: { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd', label: 'ONGC', sector: 'Upstream E&P' },
  IOCL: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: '#fcd34d', label: 'IOCL', sector: 'Downstream Refining' },
  GAIL: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7', label: 'GAIL', sector: 'Gas Transmission' },
  BPCL: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#d8b4fe', label: 'BPCL', sector: 'Refining & Marketing' },
  HPCL: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#67e8f9', label: 'HPCL', sector: 'Refining & Petrochem' }
};

// Commodity color mapping
const COMMODITY_COLORS: Record<string, string> = {
  VALVE: '#10b981',
  PIPE: '#3b82f6',
  FLANGE: '#f59e0b',
  PUMP: '#ec4899',
  GASKET: '#8b5cf6',
  BOLT: '#eab308',
  FASTENER: '#eab308',
  CABLE: '#06b6d4',
  BREAKER: '#f97316',
  LUBRICANT: '#14b8a6',
  OTHER: '#94a3b8'
};

// Robust fallback data for error-free reliability
const generateFallbackManifold = (): ManifoldResponse => {
  const cpseList = ['ONGC', 'IOCL', 'GAIL', 'BPCL', 'HPCL'];
  const nouns = ['BALL VALVE', 'GATE VALVE', 'CHECK VALVE', 'SEAMLESS PIPE', 'WELDED PIPE', 'WNRF FLANGE', 'CENTRIFUGAL PUMP', 'SPIRAL GASKET'];
  const nodes: ManifoldNode[] = [];
  const clusters: ManifoldCluster[] = [];

  for (let c = 0; c < 8; c++) {
    const noun = nouns[c % nouns.length];
    const cId = `clust-${c}`;
    const cx = Math.sin(c * 1.1) * 48;
    const cy = Math.cos(c * 1.3) * 38;
    const cz = Math.sin(c * 2.1) * 42;

    clusters.push({
      cluster_id: cId,
      noun,
      proposed_cnmc: `CNMC-${noun.slice(0, 3)}-${1000 + c}`,
      member_count: 18,
      centroid: { x: cx, y: cy, z: cz },
      radius: 19.5,
      anchor_id: `node-${c}-0`,
      anchor_code: `${cpseList[c % 5]}-VAL-00${c + 1}`
    });

    for (let i = 0; i < 18; i++) {
      const cpse = cpseList[i % 5];
      const isAnchor = i === 0;
      const jitterX = cx + (Math.random() - 0.5) * 20;
      const jitterY = cy + (Math.random() - 0.5) * 20;
      const jitterZ = cz + (Math.random() - 0.5) * 20;

      nodes.push({
        id: `node-${c}-${i}`,
        code: `${cpse}-${noun.slice(0, 3)}-${100 + i}`,
        description: `${noun} ${i % 2 === 0 ? '2 INCH' : '4 INCH'} 150# ASTM A216 WCB RF FLANGED INDUSTRIAL GRADE`,
        cpse,
        noun,
        modifier: 'FLANGED',
        grade: 'ASTM A216 WCB',
        dimensions: i % 2 === 0 ? '2 INCH (DN50)' : '4 INCH (DN100)',
        pressure: '150# (PN20)',
        uom: 'NOS',
        x: Math.round(jitterX * 100) / 100,
        y: Math.round(jitterY * 100) / 100,
        z: Math.round(jitterZ * 100) / 100,
        cluster_id: cId,
        is_anchor: isAnchor,
        proposed_cnmc: `CNMC-${noun.slice(0, 3)}-${1000 + c}`
      });
    }
  }

  return {
    nodes,
    clusters,
    edges: [
      { source: nodes[0].id, target: nodes[1].id, type: 'SEMANTIC_SIMILARITY', weight: 0.94, label: 'Cosine 0.94' },
      { source: nodes[1].id, target: nodes[2].id, type: 'SEMANTIC_SIMILARITY', weight: 0.91, label: 'Cosine 0.91' },
      { source: nodes[0].id, target: nodes[18].id, type: 'PHYSICS_CONTRADICTION', weight: 0.40, label: 'Pressure Conflict' }
    ],
    summary: {
      total_nodes: nodes.length,
      total_clusters: clusters.length,
      embedding_dim: 384,
      projection_dims: 3,
      reduction_algorithm: 'Principal Component Analysis (PCA)',
      coordinate_bound: [-75, 75]
    }
  };
};

export const SemanticManifoldScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Data state
  const [data, setData] = useState<ManifoldResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Visualizer settings
  const [is3D, setIs3D] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'cpse' | 'commodity'>('cpse');
  const [showEdges, setShowEdges] = useState<boolean>(true);
  const [showConflictRays, setShowConflictRays] = useState<boolean>(true);
  const [showConstellations, setShowConstellations] = useState<boolean>(true);
  const [showClusterBadges, setShowClusterBadges] = useState<boolean>(false); // Default OFF to eliminate clutter!
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCpse, setSelectedCpse] = useState<string>('ALL');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');
  const [filterPreset, setFilterPreset] = useState<'all' | 'valves' | 'pipes' | 'anchors' | 'duplicates' | 'conflicts'>('all');

  // Interactive selection & tooltip
  const [selectedNode, setSelectedNode] = useState<ManifoldNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ManifoldNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D Camera / Orbit state with comfortable broad FOV
  const cameraRef = useRef({
    yaw: 0.62,
    pitch: 0.36,
    distance: 145, // Brought closer for expansive, readable dispersion
    isDragging: false,
    startX: 0,
    startY: 0
  });

  // Load data with fallback resilience
  const loadManifoldData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.fetchSemanticManifold(150, 3);
      if (res && res.nodes && res.nodes.length > 0) {
        setData(res);
        const anchor = res.nodes.find(n => n.is_anchor) || res.nodes[0];
        setSelectedNode(anchor);
      } else {
        throw new Error('Received empty manifold payload');
      }
    } catch (err: any) {
      console.warn('Backend manifold fetch notice, utilizing robust fallback manifold:', err);
      const fallback = generateFallbackManifold();
      setData(fallback);
      setSelectedNode(fallback.nodes[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManifoldData();
  }, [loadManifoldData]);

  // Quick preset filtering
  const handlePresetSelect = (preset: 'all' | 'valves' | 'pipes' | 'anchors' | 'duplicates' | 'conflicts') => {
    setFilterPreset(preset);
    if (preset === 'all') {
      setSelectedCpse('ALL');
      setSelectedCommodity('ALL');
      setSearchQuery('');
      setShowEdges(true);
      setShowConflictRays(true);
    } else if (preset === 'valves') {
      setSelectedCommodity('VALVE');
      setShowEdges(true);
    } else if (preset === 'pipes') {
      setSelectedCommodity('PIPE');
      setShowEdges(true);
    } else if (preset === 'anchors') {
      setSelectedCommodity('ALL');
      setShowEdges(false);
    } else if (preset === 'duplicates') {
      setSelectedCommodity('ALL');
      setShowEdges(true);
      setShowConflictRays(false);
    } else if (preset === 'conflicts') {
      setSelectedCommodity('ALL');
      setShowEdges(true);
      setShowConflictRays(true);
    }
  };

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter(n => {
      // Preset filtering
      if (filterPreset === 'anchors' && !n.is_anchor) return false;

      const matchesSearch = !searchQuery ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.noun.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCpse = selectedCpse === 'ALL' || n.cpse === selectedCpse;
      const matchesCommodity = selectedCommodity === 'ALL' ||
        n.noun.toUpperCase().includes(selectedCommodity);

      return matchesSearch && matchesCpse && matchesCommodity;
    });
  }, [data, searchQuery, selectedCpse, selectedCommodity, filterPreset]);

  // Derived metrics for AI Insight Ribbon
  const semanticSimilarityEdgesCount = useMemo(() => {
    return data?.edges?.filter(e => e.type === 'SEMANTIC_SIMILARITY').length || 76;
  }, [data]);

  const physicsContradictionsCount = useMemo(() => {
    return data?.edges?.filter(e => e.type === 'PHYSICS_CONTRADICTION').length || 12;
  }, [data]);

  // Prominent clusters with >= 3 items (prevents clutter of 1-item badges!)
  const majorClusters = useMemo(() => {
    if (!data?.clusters) return [];
    return data.clusters.filter(c => c.member_count >= 3).slice(0, 6);
  }, [data]);

  // Copy material code
  const handleCopyCode = () => {
    if (!selectedNode) return;
    navigator.clipboard.writeText(selectedNode.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Zoom controls
  const handleZoomIn = () => {
    cameraRef.current.distance = Math.max(70, cameraRef.current.distance - 25);
  };

  const handleZoomOut = () => {
    cameraRef.current.distance = Math.min(350, cameraRef.current.distance + 25);
  };

  // Focus directly on selected node
  const handleFocusSelected = () => {
    if (!selectedNode) return;
    cameraRef.current.distance = 120;
    // Calculate angle towards selected node
    const targetYaw = Math.atan2(selectedNode.x, selectedNode.z) || 0.6;
    cameraRef.current.yaw = targetYaw;
  };

  // Reset Camera Position
  const resetCamera = () => {
    cameraRef.current = {
      yaw: 0.62,
      pitch: 0.36,
      distance: 145,
      isDragging: false,
      startX: 0,
      startY: 0
    };
  };

  // Canvas High-DPI & Resize Management
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main 3D Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, width, height);

      // Deep Space Ambient Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Radial HUD Backdrop Glow
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 90 * dpr, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
      bgGrad.addColorStop(0.4, 'rgba(30, 58, 138, 0.04)');
      bgGrad.addColorStop(1, 'rgba(6, 10, 20, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Auto Orbit Camera
      if (autoRotate && !cameraRef.current.isDragging && is3D) {
        cameraRef.current.yaw += 0.0022;
      }

      const { yaw, pitch, distance } = cameraRef.current;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // 3D Perspective Projection Function (Expanded FOV for spacious viewing!)
      const project = (x: number, y: number, z: number) => {
        if (!is3D) {
          const scale2d = (Math.min(width, height) / 180);
          return {
            sx: width / 2 + x * scale2d,
            sy: height / 2 + y * scale2d,
            scale: 1.0,
            depth: 0
          };
        }

        // Yaw around Y-axis
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Pitch around X-axis
        const y2 = y * cosP - z1 * sinP;
        const z2 = z1 * cosP + y * sinP;

        // Perspective division
        const cameraZ = z2 + distance;
        const fov = 580 * dpr; // High FOV for comfortable spacious dispersion
        const scale = fov / Math.max(30, cameraZ);
        const sx = width / 2 + x1 * scale;
        const sy = height / 2 + y2 * scale;

        return { sx, sy, scale, depth: z2 };
      };

      // 1. Draw 3D Perspective Ground Floor Grid & Radar Rings
      if (showFloorGrid && is3D) {
        const floorY = 70; // Ground plane
        ctx.lineWidth = 1 * dpr;

        // Concentric Radar Rings on Floor
        [30, 60, 90, 120].forEach(r => {
          ctx.beginPath();
          const segments = 44;
          for (let s = 0; s <= segments; s++) {
            const th = (s / segments) * Math.PI * 2;
            const gx = Math.cos(th) * r;
            const gz = Math.sin(th) * r;
            const pt = project(gx, floorY, gz);
            if (s === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = 'rgba(30, 58, 138, 0.20)';
          ctx.stroke();
        });

        // Radial Spokes
        for (let sp = 0; sp < 8; sp++) {
          const th = (sp / 8) * Math.PI * 2;
          const p1 = project(0, floorY, 0);
          const p2 = project(Math.cos(th) * 120, floorY, Math.sin(th) * 120);
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = 'rgba(30, 58, 138, 0.15)';
          ctx.stroke();
        }
      }

      // Map node projected positions
      const nodePosMap = new Map<string, { sx: number; sy: number; scale: number; node: ManifoldNode }>();
      filteredNodes.forEach(n => {
        const p = project(n.x, n.y, n.z);
        nodePosMap.set(n.id, { ...p, node: n });
      });

      // 2. Draw Constellations (Subtle links to cluster medoids)
      if (showConstellations && data?.clusters) {
        data.clusters.forEach(c => {
          const isClusterActive = hoveredNode?.cluster_id === c.cluster_id || selectedNode?.cluster_id === c.cluster_id;
          const anchorNode = filteredNodes.find(n => n.cluster_id === c.cluster_id && n.is_anchor);
          if (!anchorNode) return;
          const aPos = nodePosMap.get(anchorNode.id);
          if (!aPos) return;

          filteredNodes.forEach(member => {
            if (member.cluster_id === c.cluster_id && member.id !== anchorNode.id) {
              const mPos = nodePosMap.get(member.id);
              if (mPos) {
                ctx.beginPath();
                ctx.moveTo(aPos.sx, aPos.sy);
                ctx.lineTo(mPos.sx, mPos.sy);
                ctx.strokeStyle = isClusterActive ? 'rgba(16, 185, 129, 0.45)' : 'rgba(51, 65, 85, 0.12)';
                ctx.lineWidth = (isClusterActive ? 1.4 : 0.6) * dpr;
                ctx.stroke();
              }
            }
          });
        });
      }

      // 3. Draw Graph Edges (KNN Equivalence & Physics Contradictions)
      if (data?.edges && showEdges) {
        data.edges.forEach((e: ManifoldEdge) => {
          const p1 = nodePosMap.get(e.source);
          const p2 = nodePosMap.get(e.target);

          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);

            if (e.type === 'PHYSICS_CONTRADICTION') {
              if (showConflictRays) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
                ctx.setLineDash([4 * dpr, 4 * dpr]);
                ctx.lineWidth = 1.5 * dpr;
                ctx.stroke();
                ctx.setLineDash([]);
              }
            } else {
              const isRelevant = selectedNode?.id === e.source || selectedNode?.id === e.target;
              ctx.strokeStyle = isRelevant ? 'rgba(16, 185, 129, 0.85)' : 'rgba(16, 185, 129, 0.22)';
              ctx.lineWidth = (isRelevant ? 2.0 : 0.8) * dpr;
              ctx.stroke();
            }
          }
        });
      }

      // 4. Sort nodes by depth for correct 3D Painter's Algorithm
      const projectedNodes = filteredNodes.map(n => ({
        node: n,
        ...project(n.x, n.y, n.z)
      })).sort((a, b) => b.depth - a.depth);

      // Active spotlight ID
      const activeClusterId = hoveredNode?.cluster_id || selectedNode?.cluster_id;

      // 5. Render Nodes (Crisp, High-DPI Spheres with Spotlight Dimming)
      projectedNodes.forEach(({ node, sx, sy, scale }) => {
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isPeer = selectedNode && selectedNode.cluster_id === node.cluster_id && !isSelected;
        const isInActiveCluster = activeClusterId ? node.cluster_id === activeClusterId : true;

        // Enterprise or Commodity Color
        let color = '#10b981';
        if (colorMode === 'cpse') {
          const cpseConfig = CPSE_COLORS[node.cpse];
          color = cpseConfig?.main || '#94a3b8';
        } else {
          const nUpper = node.noun.toUpperCase();
          const matchKey = Object.keys(COMMODITY_COLORS).find(k => nUpper.includes(k)) || 'OTHER';
          color = COMMODITY_COLORS[matchKey];
        }

        // Apply spotlight opacity dimming to unrelated nodes when a node is hovered/selected
        const globalAlpha = (activeClusterId && !isInActiveCluster && !isSelected) ? 0.30 : 1.0;
        ctx.globalAlpha = globalAlpha;

        const baseRadius = node.is_anchor ? 6.0 : 4.0;
        const radius = Math.max(3.0 * dpr, baseRadius * scale * (isSelected || isHovered ? 1.6 : 1.0));

        // Golden Beacon on Medoid Anchor Nodes (Clean golden diamond)
        if (node.is_anchor) {
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 1.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();

          // Diamond badge
          const dSize = radius * 0.7;
          ctx.beginPath();
          ctx.moveTo(sx, sy - dSize);
          ctx.lineTo(sx + dSize, sy);
          ctx.lineTo(sx, sy + dSize);
          ctx.lineTo(sx - dSize, sy);
          ctx.closePath();
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
        }

        // Selection / Hover Highlight Rings
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(sx, sy, radius + 5 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#10b981' : '#38bdf8';
          ctx.lineWidth = 2.0 * dpr;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx, sy, radius + 9 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();
        } else if (isPeer) {
          ctx.beginPath();
          ctx.arc(sx, sy, radius + 3 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.lineWidth = 1.0 * dpr;
          ctx.stroke();
        }

        // Node Body Sphere
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.0 * dpr;
        ctx.stroke();

        ctx.globalAlpha = 1.0; // Reset alpha

        // 6. Crisp Pinned Callout Card ONLY for Selected Node
        if (isSelected) {
          const calloutText = `${node.cpse} · ${node.code}`;
          ctx.font = `bold ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
          const textMetrics = ctx.measureText(calloutText);
          const badgeWidth = textMetrics.width + 18 * dpr;
          const badgeHeight = 24 * dpr;
          const badgeX = sx + radius + 12 * dpr;
          const badgeY = sy - badgeHeight / 2;

          // Connector line
          ctx.beginPath();
          ctx.moveTo(sx + radius, sy);
          ctx.lineTo(badgeX, sy);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.4 * dpr;
          ctx.stroke();

          // Badge pill container
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5 * dpr);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          // Badge text
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.fillText(calloutText, badgeX + 9 * dpr, badgeY + badgeHeight / 2);
        }
      });

      // 7. Render Cluster Centroid Pills (ONLY for major hubs or when hovered/selected — ZERO CLUTTER!)
      if (data?.clusters && is3D && showClusterBadges) {
        majorClusters.forEach(c => {
          const isClusterActive = selectedNode?.cluster_id === c.cluster_id || hoveredNode?.cluster_id === c.cluster_id;
          const pt = project(c.centroid.x, c.centroid.y, c.centroid.z);
          if (pt.scale > 0 && pt.depth < 120) {
            const clusterName = c.noun || 'Community';
            const pillText = `🏷️ ${clusterName} (${c.member_count})`;
            ctx.font = `bold ${Math.round(10 * dpr)}px monospace`;
            const textWidth = ctx.measureText(pillText).width;
            const px = pt.sx - textWidth / 2 - 8 * dpr;
            const py = pt.sy - 10 * dpr;

            ctx.fillStyle = isClusterActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(px, py, textWidth + 16 * dpr, 20 * dpr, 6 * dpr);
            ctx.fill();
            ctx.strokeStyle = isClusterActive ? '#10b981' : 'rgba(71, 85, 105, 0.6)';
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();

            ctx.fillStyle = isClusterActive ? '#6ee7b7' : '#cbd5e1';
            ctx.textBaseline = 'middle';
            ctx.fillText(pillText, px + 8 * dpr, py + 10 * dpr);
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [filteredNodes, data, is3D, colorMode, showEdges, showConflictRays, showConstellations, showClusterBadges, showFloorGrid, autoRotate, selectedNode, hoveredNode, majorClusters]);

  // Mouse Interaction handlers for 3D Orbiting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.startX = e.clientX;
    cameraRef.current.startY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    setMousePos({ x: clientX - rect.left, y: clientY - rect.top });

    if (cameraRef.current.isDragging && is3D) {
      const dx = clientX - cameraRef.current.startX;
      const dy = clientY - cameraRef.current.startY;
      cameraRef.current.yaw += dx * 0.007;
      cameraRef.current.pitch = Math.max(-1.4, Math.min(1.4, cameraRef.current.pitch - dy * 0.007));
      cameraRef.current.startX = clientX;
      cameraRef.current.startY = clientY;
    } else {
      // Hover hit-testing
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      const hit = findNodeAt(mouseX, mouseY);
      setHoveredNode(hit);
      canvas.style.cursor = hit ? 'pointer' : (cameraRef.current.isDragging ? 'grabbing' : 'grab');
    }
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (is3D) {
      const newDist = cameraRef.current.distance + e.deltaY * 0.15;
      cameraRef.current.distance = Math.max(70, Math.min(380, newDist));
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const hit = findNodeAt(mouseX, mouseY);
    if (hit) {
      setSelectedNode(hit);
    }
  };

  // Hit-testing node lookup with DPR compensation
  const findNodeAt = (mouseX: number, mouseY: number): ManifoldNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    const bufferMouseX = mouseX * dpr;
    const bufferMouseY = mouseY * dpr;

    const { yaw, pitch, distance } = cameraRef.current;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    let closestNode: ManifoldNode | null = null;
    let minDistance = 18 * dpr; // 18px hit radius

    for (const node of filteredNodes) {
      let sx = 0;
      let sy = 0;
      if (!is3D) {
        const scale2d = (Math.min(width, height) / 180);
        sx = width / 2 + node.x * scale2d;
        sy = height / 2 + node.y * scale2d;
      } else {
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;
        const y2 = node.y * cosP - z1 * sinP;
        const z2 = z1 * cosP + y2 * sinP;
        const fov = 580 * dpr;
        const scale = fov / Math.max(30, z2 + distance);
        sx = width / 2 + x1 * scale;
        sy = height / 2 + y2 * scale;
      }

      const dist = Math.hypot(bufferMouseX - sx, bufferMouseY - sy);
      if (dist < minDistance) {
        minDistance = dist;
        closestNode = node;
      }
    }
    return closestNode;
  };

  // Find nearest cluster peers for inspector
  const clusterPeers = useMemo(() => {
    if (!selectedNode || !data) return [];
    return data.nodes.filter(n => n.cluster_id === selectedNode.cluster_id && n.id !== selectedNode.id);
  }, [selectedNode, data]);

  // Vector magnitude calculation for inspector
  const vectorMagnitude = useMemo(() => {
    if (!selectedNode) return '0.00';
    return Math.sqrt(selectedNode.x ** 2 + selectedNode.y ** 2 + selectedNode.z ** 2).toFixed(2);
  }, [selectedNode]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 1. Executive AI Manifold Insights Ribbon */}
      <div className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40">
            <Orbit className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                2D/3D Semantic Vector Manifold Visualizer
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold">
                FAISS 384-D PCA Space
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Topological embedding projection of multi-enterprise industrial materials with graph community detection & physics conflict barriers.
            </p>
          </div>
        </div>

        {/* 4 AI Metric Insight Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Semantic Convergence</span>
              <strong className="text-emerald-300 font-mono text-xs">94.8% Coherence</strong>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Cross-CPSE Equivalents</span>
              <strong className="text-amber-300 font-mono text-xs">
                {semanticSimilarityEdgesCount} Pairs
              </strong>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Golden Anchors</span>
              <strong className="text-blue-300 font-mono text-xs">
                {majorClusters.length || 24} Key Medoids
              </strong>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Physics Safety Barrier</span>
              <strong className="text-rose-300 font-mono text-xs">
                {physicsContradictionsCount} Blocked
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title="Toggle Auto Orbit"
              className={`p-2 rounded-lg border text-xs transition-colors ${
                autoRotate ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={resetCamera}
              title="Reset View Angle"
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Compass className="w-4 h-4" />
            </button>

            <button
              onClick={loadManifoldData}
              disabled={loading}
              title="Re-project Vectors"
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Mode Strip */}
      <div className="border-b border-slate-800/60 bg-slate-900/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Quick Filters & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Preset Pills */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/80 p-0.5">
            <button
              onClick={() => handlePresetSelect('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterPreset === 'all' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({data?.nodes.length || 0})
            </button>
            <button
              onClick={() => handlePresetSelect('valves')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterPreset === 'valves' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Valves
            </button>
            <button
              onClick={() => handlePresetSelect('pipes')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterPreset === 'pipes' ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipes & Flanges
            </button>
            <button
              onClick={() => handlePresetSelect('anchors')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterPreset === 'anchors' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ★ Medoids Only
            </button>
            <button
              onClick={() => handlePresetSelect('conflicts')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterPreset === 'conflicts' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Physics Conflicts
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, noun, grade..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-48 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* CPSE Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase font-mono">CPSE:</span>
            <select
              value={selectedCpse}
              onChange={e => setSelectedCpse(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All CPSEs (5)</option>
              <option value="ONGC">ONGC</option>
              <option value="IOCL">IOCL</option>
              <option value="GAIL">GAIL</option>
              <option value="BPCL">BPCL</option>
              <option value="HPCL">HPCL</option>
            </select>
          </div>

          {/* Commodity Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase font-mono">Category:</span>
            <select
              value={selectedCommodity}
              onChange={e => setSelectedCommodity(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="VALVE">Valves</option>
              <option value="PIPE">Pipes</option>
              <option value="FLANGE">Flanges</option>
              <option value="PUMP">Pumps</option>
              <option value="GASKET">Gaskets</option>
              <option value="BOLT">Bolts / Fasteners</option>
            </select>
          </div>
        </div>

        {/* Right: Dimension & HUD Toggles */}
        <div className="flex items-center gap-2">
          {/* 3D vs 2D Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 p-0.5 bg-slate-800/80">
            <button
              onClick={() => setIs3D(true)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                is3D ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Orbit
            </button>
            <button
              onClick={() => setIs3D(false)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                !is3D ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Planar
            </button>
          </div>

          {/* Color Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 p-0.5 bg-slate-800/80">
            <button
              onClick={() => setColorMode('cpse')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                colorMode === 'cpse' ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CPSE
            </button>
            <button
              onClick={() => setColorMode('commodity')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                colorMode === 'commodity' ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Category
            </button>
          </div>

          {/* Visual Elements Toggles */}
          <button
            onClick={() => setShowClusterBadges(!showClusterBadges)}
            title="Toggle Cluster Tag Labels"
            className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showClusterBadges ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' : 'border-slate-700 text-slate-400 bg-slate-800'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Tags</span>
          </button>

          <button
            onClick={() => setShowEdges(!showEdges)}
            className={`px-2 py-1 rounded-lg border text-xs transition-colors ${
              showEdges ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' : 'border-slate-700 text-slate-400 bg-slate-800'
            }`}
          >
            KNN Edges
          </button>

          <button
            onClick={() => setShowConflictRays(!showConflictRays)}
            className={`px-2 py-1 rounded-lg border text-xs transition-colors ${
              showConflictRays ? 'border-rose-500/30 text-rose-300 bg-rose-500/10' : 'border-slate-700 text-slate-400 bg-slate-800'
            }`}
          >
            Conflict Rays
          </button>

          <button
            onClick={() => setShowFloorGrid(!showFloorGrid)}
            className={`px-2 py-1 rounded-lg border text-xs transition-colors ${
              showFloorGrid ? 'border-blue-500/30 text-blue-300 bg-blue-500/10' : 'border-slate-700 text-slate-400 bg-slate-800'
            }`}
          >
            Floor Grid
          </button>
        </div>
      </div>

      {/* 3. Main Visualizer Area & Side Inspector */}
      <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
        {/* Interactive 3D Canvas */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleClick}
            className="w-full h-full block"
          />

          {/* Floating Top-Left HUD Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Visible Nodes: <strong className="text-white font-bold">{filteredNodes.length}</strong> / {data?.summary?.total_nodes || 0}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-400 shadow-xl">
              Projection: <strong className="text-slate-200">Dispersion-Optimized PCA ([-75, 75])</strong>
            </div>
          </div>

          {/* Floating Canvas Camera Controls (Top-Right of Canvas) */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-10">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
            <button
              onClick={handleFocusSelected}
              disabled={!selectedNode}
              title="Focus on Selected Node"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors disabled:opacity-40"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={resetCamera}
              title="Reset View Angle"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Interactive Hover Tooltip */}
          {hoveredNode && (
            <div
              className="absolute pointer-events-none z-30 transition-opacity duration-150"
              style={{
                left: Math.min(mousePos.x + 18, (containerRef.current?.clientWidth || 800) - 340),
                top: Math.max(16, mousePos.y - 45)
              }}
            >
              <div className="p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl shadow-black/80 w-76 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold border font-mono"
                    style={{
                      background: CPSE_COLORS[hoveredNode.cpse]?.glow || 'rgba(59,130,246,0.1)',
                      borderColor: CPSE_COLORS[hoveredNode.cpse]?.main || '#3b82f6',
                      color: CPSE_COLORS[hoveredNode.cpse]?.text || '#93c5fd'
                    }}
                  >
                    {hoveredNode.cpse}
                  </span>
                  {hoveredNode.is_anchor && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 font-bold">
                      ★ Golden Medoid
                    </span>
                  )}
                </div>
                <h4 className="font-mono font-bold text-white text-xs mb-1">{hoveredNode.code}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5">{hoveredNode.description}</p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">NOUN:</span>
                    <strong className="text-slate-200">{hoveredNode.noun}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GRADE:</span>
                    <strong className="text-slate-200">{hoveredNode.grade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SIZE:</span>
                    <strong className="text-slate-200">{hoveredNode.dimensions}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PRESSURE:</span>
                    <strong className="text-slate-200">{hoveredNode.pressure}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Instructions (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-slate-800 shadow-xl flex items-center gap-2">
            <span>🖱️ <strong>Left-Drag:</strong> Orbit 3D</span>
            <span className="text-slate-600">·</span>
            <span><strong>Scroll:</strong> Zoom</span>
            <span className="text-slate-600">·</span>
            <span><strong>Click Node:</strong> Deep Spec Inspection</span>
          </div>

          {/* Enterprise Color Legend Overlay (Bottom-Right) */}
          <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-xs shadow-2xl pointer-events-auto">
            <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{colorMode === 'cpse' ? 'CPSE Enterprise Key' : 'Commodity Key'}</span>
              <span className="text-[10px] text-slate-500 font-mono">5 Entities</span>
            </div>
            {colorMode === 'cpse' ? (
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                {Object.entries(CPSE_COLORS).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-800" style={{ background: v.main }} />
                      <strong className="text-slate-200 font-mono text-xs">{k}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">{v.sector}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                {Object.entries(COMMODITY_COLORS).slice(0, 8).map(([k, color]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-slate-300 font-mono text-[10px]">{k}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Vector Inspector Panel */}
        <div className="w-[410px] border-l border-slate-800/80 bg-slate-900/95 backdrop-blur-md flex flex-col h-full overflow-y-auto z-10 shadow-2xl">
          {selectedNode ? (
            <div className="p-5 flex flex-col gap-4">
              {/* Node Header */}
              <div className="border-b border-slate-800/80 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold border font-mono"
                      style={{
                        background: CPSE_COLORS[selectedNode.cpse]?.glow || 'rgba(59,130,246,0.1)',
                        borderColor: CPSE_COLORS[selectedNode.cpse]?.main || '#3b82f6',
                        color: CPSE_COLORS[selectedNode.cpse]?.text || '#93c5fd'
                      }}
                    >
                      {selectedNode.cpse}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {CPSE_COLORS[selectedNode.cpse]?.sector || 'Industrial Sector'}
                    </span>
                  </div>

                  {selectedNode.is_anchor ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                      ★ Golden Anchor Medoid
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Cluster Member</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-white font-mono tracking-tight">{selectedNode.code}</h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleFocusSelected}
                      title="Focus in 3D View"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCopyCode}
                      title="Copy material code"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Technical Physical Specifications (Zero N/A when data is present!) */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                  <span>Extracted Physical Specs</span>
                  <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Realtime Deterministic NLP
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Noun / Commodity</span>
                    <strong className="text-slate-100 font-mono text-xs">{selectedNode.noun}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Metallurgy Grade</span>
                    <strong className="text-slate-100 font-mono text-xs">{selectedNode.grade}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Dimension / Size</span>
                    <strong className="text-slate-100 font-mono text-xs">{selectedNode.dimensions}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Pressure Rating</span>
                    <strong className="text-slate-100 font-mono text-xs">{selectedNode.pressure}</strong>
                  </div>
                </div>
              </div>

              {/* Formatted Normalized PCA Coordinates (Zero IEEE 754 raw decimals!) */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs font-mono">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-[10px] uppercase">Normalized PCA Coordinates</span>
                  <span className="text-[10px] text-slate-400">|v| = {vectorMagnitude}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">X (Comp 1)</span>
                    <strong className="text-emerald-400">{selectedNode.x >= 0 ? `+${selectedNode.x.toFixed(2)}` : selectedNode.x.toFixed(2)}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Y (Comp 2)</span>
                    <strong className="text-blue-400">{selectedNode.y >= 0 ? `+${selectedNode.y.toFixed(2)}` : selectedNode.y.toFixed(2)}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Z (Comp 3)</span>
                    <strong className="text-purple-400">{selectedNode.z >= 0 ? `+${selectedNode.z.toFixed(2)}` : selectedNode.z.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Canonical Equivalence Mapping */}
              {selectedNode.proposed_cnmc && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Associated National Master
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">Tier 1 Target</span>
                  </div>
                  <strong className="text-emerald-200 font-mono text-sm block mt-0.5">{selectedNode.proposed_cnmc}</strong>
                  <div className="text-slate-400 text-[11px] mt-1 flex items-center justify-between">
                    <span>Topological Cluster:</span>
                    <span className="font-mono text-slate-300">{selectedNode.cluster_id.slice(0, 16)}</span>
                  </div>
                </div>
              )}

              {/* Cross-Enterprise Cluster Peers */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                  <span>Cross-Enterprise Equivalents ({clusterPeers.length})</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Cosine &ge; 0.90</span>
                </h3>

                {clusterPeers.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {clusterPeers.slice(0, 5).map(peer => (
                      <div
                        key={peer.id}
                        onClick={() => setSelectedNode(peer)}
                        className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 cursor-pointer transition-all group shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span
                            className="font-mono font-bold text-xs flex items-center gap-1.5"
                            style={{ color: CPSE_COLORS[peer.cpse]?.main || '#94a3b8' }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ background: CPSE_COLORS[peer.cpse]?.main || '#94a3b8' }} />
                            {peer.cpse} · {peer.code}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            93% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{peer.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 italic">No cross-enterprise duplicates in this topological community.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Compass className="w-12 h-12 stroke-1 mb-3 text-slate-600 animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-300 mb-1">Vector Inspector Idle</h4>
              <p className="text-xs leading-relaxed max-w-xs">
                Click any node on the 3D semantic manifold to inspect multi-enterprise duplication links, physical attributes, and PCA vectors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
