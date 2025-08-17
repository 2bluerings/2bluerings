import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  useStore,
  useNodes,
  MiniMap
} from '@xyflow/react'
import type { Node } from '@xyflow/react'
import CustomNode from './ui/custom-node'
import { useMemo, useEffect, useRef, useState, type MouseEvent } from 'react'
import { useCssVar } from '@/hooks/use-css-var'
import { useContextNodesStore, type ContextNode } from '@/hooks/use-context-nodes-store'
import { useModesStore } from '@/hooks/use-modes-store'
import { useParams } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { useApiStore } from '@/hooks/use-api-store'
import { useReactFlow } from '@xyflow/react'
import { Frown } from 'lucide-react'
import EmptyState from './ui/empty-state'
const nodeTypes = { customNode: CustomNode }
const defaultViewport = { x: 0, y: 0, zoom: 0.8 }


function useVisibleNodeIds() {
  const rf = useReactFlow()
  const selectedMode = useModesStore((s) => s.selectedMode)

  const [tx, ty, zoom] = useStore((s) => s.transform);
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const nodes = useNodes();

  const [ids, setIds] = useState<string[]>([]);

  const viewportRect = useMemo(
    () => ({
      x: -tx / zoom,
      y: -ty / zoom,
      width: width / zoom,
      height: height / zoom,
    }),
    [tx, ty, zoom, width, height]
  );

  const allMeasured = nodes.every((n) => n.width != null && n.height != null);

  useEffect(() => {
    if (selectedMode?.name !== "focus") {
      setIds([])
      return
    }

    const fullyInside: Node[] = rf.getIntersectingNodes(viewportRect);

    const startX = viewportRect.x
    const endX = viewportRect.x + viewportRect.width

    const startY = viewportRect.y
    const endY = viewportRect.y + viewportRect.height

    const ids = fullyInside.filter((n) => {
      const nx = n.position.x + (n.measured?.width ?? 0)
      const ny = n.position.y + (n.measured?.height ?? 0)

      return (
        n.position.x >= startX &&
        (nx - 68) <= endX &&
        n.position.y >= startY &&
        ny <= endY
      )
    }).map((n) => n.id)

    setIds(ids);
  }, [rf, viewportRect, nodes, allMeasured, selectedMode]);

  return ids;
}

function ContextUi() {
  const { projectId } = useParams<{ projectId: string }>()
  const { screenToFlowPosition, deleteElements } = useReactFlow()
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges,, onEdgesChange] = useEdgesState([])
  const { get: getBackground } = useCssVar('--background')
  const { get: getMuted } = useCssVar('--muted')
  const socketRef = useRef<WebSocket | null>(null);
  const { theme } = useTheme()
  const createSocket = useApiStore((s) => s.createSocket)
  const updateNode = useContextNodesStore((s) => s.update)
  const setVisibleNodeIds = useContextNodesStore((s) => s.setVisibleNodeIds)
  const deletedContextNodeId = useContextNodesStore((s) => s.deletedNodeId)
  const visibleNodeIds = useVisibleNodeIds()
  const colorMode = theme === 'dark' ? 'dark' : 'light'

  const [_colors, setColors] = useState(() => ({
    bg: getBackground(),
    muted: getMuted(),
  }))

  useEffect(() => {
    setColors({
      bg: getBackground(),
      muted: getMuted(),
    });
  }, [theme])

  useEffect(() => {
    setNodes([]);

    if (!projectId) return;
    const socket = createSocket(`/api/v1/projects/${projectId}/context_nodes/stream`);
    if (!socket) return;

    socketRef.current = socket;

    socket.onmessage = (event) => {
      if (event.data === "[[DONE]]") {
        socket.close();
        return;
      }

      const contextNode: ContextNode = JSON.parse(event.data);

      setNodes((prev) => {
        const exists = prev.find((n) => n.id === contextNode.id);
        if (exists) {
          return prev.map((n) =>
            n.id === contextNode.id ? { ...n, data: contextNode } : n
          );
        } else {
          const rect = wrapperRef.current?.getBoundingClientRect();

          const NODE_W = 400
          const NODE_H = 180

          const center = {
            x: (((rect?.x ?? 0) + (rect?.width ?? 0)) / 2) + (150),
            y: ((rect?.y ?? 0) + (rect?.height ?? 0)) / 2
          }

          const flowCenter = screenToFlowPosition(center)

          const newNode = {
            id: contextNode.id,
            type: 'customNode',
            position: {
              x: contextNode.pos_x || (flowCenter.x - NODE_W / 2),
              y: contextNode.pos_y || (flowCenter.y - NODE_H / 2)
            },
            data: contextNode,
            style: { minWidth: NODE_W },
          };

          return [...prev, newNode];
        }
      });
    };

    return () => socket.close();
  }, [projectId, setNodes, screenToFlowPosition])

  useEffect(() => {
    if (!deletedContextNodeId) return

    deleteElements({
      nodes: [{ id: deletedContextNodeId }]
    })
  }, [deletedContextNodeId])

  const onNodeDragStop = (_e: MouseEvent, node: Node) => {
    updateNode(node.id, {
      pos_x: node.position.x,
      pos_y: node.position.y
    })
  }

  useEffect(() => {
    setTimeout(() => {
      setVisibleNodeIds(visibleNodeIds)
    }, 100)
  }, [visibleNodeIds])

  return (
    <div style={{ height: '100%', width: '100%' }} ref={wrapperRef}>
      <ReactFlow
        key={`rf-${theme}`}
        colorMode={colorMode}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={defaultViewport}
        nodes={nodes}
        edges={edges}
        onNodeDragStop={onNodeDragStop}
      >
        <style>
          {
            `
              .react-flow__background pattern circle {
                opacity: ${theme === "dark" ? 0.5 : 1};
              }
            `
          }
        </style>
        <Background
          bgColor={theme == "dark" ? "#111" : "inherit"}
          key={`rf-${theme}`}
          gap={25}
          variant={BackgroundVariant.Dots}
        />
        <Controls />
        <MiniMap pannable={true} zoomable={true}/>
      </ReactFlow>
      {
        nodes.length === 0 && (
          <EmptyState
            Icon={Frown}
            title="No context yet."
            description="
            This is your context pane, you can see everything important that you've asked the llm to learn or memorize. 
            You can also use focus mode to focus on only specific nodes."
          >
            </EmptyState>
        )
      }
    </div>
  );
}

export default ContextUi;
