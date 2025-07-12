"use client";

import type React from "react";
import { forwardRef, useState, useEffect } from "react";
import { TextNode } from "@/components/nodes/TextNode";
import type { FlowNode, FlowEdge } from "@/types/flow";

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: FlowNode | null;
  onNodeSelect: (node: FlowNode) => void;
  onCanvasClick: () => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

export const FlowCanvas = forwardRef<HTMLDivElement, FlowCanvasProps>(
  (
    {
      nodes,
      edges,
      selectedNode,
      onNodeSelect,
      onCanvasClick,
      onNodeMove,
      onConnect,
      onDragOver,
      onDrop,
    },
    ref
  ) => {
    // Track the connection process when user is connecting two nodes
    const [connecting, setConnecting] = useState<{
      sourceId: string;
      sourceHandle: { x: number; y: number }; // Starting point of connection
      currentMouse: { x: number; y: number }; // Current mouse position
    } | null>(null);

    // When user starts making a connection from a node
    const handleConnectionStart = (
      nodeId: string,
      handlePosition: { x: number; y: number }
    ) => {
      setConnecting({
        sourceId: nodeId,
        sourceHandle: handlePosition,
        currentMouse: handlePosition,
      });
    };

    // While dragging the connection line
    const handleConnectionDrag = (mousePosition: { x: number; y: number }) => {
      if (connecting) {
        setConnecting({
          ...connecting,
          currentMouse: mousePosition,
        });
      }
    };

    // When user ends the connection on another node
    const handleConnectionEnd = (targetNodeId: string) => {
      if (connecting && connecting.sourceId !== targetNodeId) {
        onConnect(connecting.sourceId, targetNodeId);
      }
      setConnecting(null);
    };

    // Listen for mouse movements globally when connecting nodes
    useEffect(() => {
      if (!connecting) return;

      const handleMouseMove = (e: MouseEvent) => {
        const canvas = document.querySelector(".flow-canvas");
        const canvasRect = canvas?.getBoundingClientRect();
        if (!canvasRect) return;

        const mousePos = {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        };
        handleConnectionDrag(mousePos);
      };

      // Stop connecting if mouse is released
      const handleMouseUp = () => {
        setConnecting(null);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [connecting]);

    // When clicking on empty canvas area
    const handleCanvasClick = (event: React.MouseEvent) => {
      if (
        event.target === event.currentTarget ||
        (event.target as HTMLElement).classList.contains("grid-background")
      ) {
        if (connecting) {
          setConnecting(null); // Cancel the connection
        } else {
          onCanvasClick(); // Deselect any selected node
        }
      }
    };

    // Create a curved path between two nodes
    const getEdgePath = (edge: FlowEdge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return "";

      const sourceX = sourceNode.position.x + 200;
      const sourceY = sourceNode.position.y + 40;
      const targetX = targetNode.position.x;
      const targetY = targetNode.position.y + 40;

      const controlPointOffset = Math.abs(targetX - sourceX) * 0.5;
      const cp1x = sourceX + controlPointOffset;
      const cp2x = targetX - controlPointOffset;

      return `M ${sourceX} ${sourceY} C ${cp1x} ${sourceY} ${cp2x} ${targetY} ${targetX} ${targetY}`;
    };

    // Create the preview line when user is dragging a connection
    const getConnectionPreviewPath = () => {
      if (!connecting) return "";

      const { sourceHandle, currentMouse } = connecting;
      const controlPointOffset =
        Math.abs(currentMouse.x - sourceHandle.x) * 0.5;
      const cp1x = sourceHandle.x + controlPointOffset;
      const cp2x = currentMouse.x - controlPointOffset;

      return `M ${sourceHandle.x} ${sourceHandle.y} C ${cp1x} ${sourceHandle.y} ${cp2x} ${currentMouse.y} ${currentMouse.x} ${currentMouse.y}`;
    };

    return (
      <div
        ref={ref}
        className="w-full h-full relative overflow-hidden bg-gray-50 flow-canvas"
        onClick={handleCanvasClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none grid-background"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* SVG for connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none mt-2"
          style={{ zIndex: 1 }}
        >
          {edges.map((edge) => (
            <path
              key={edge.id}
              d={getEdgePath(edge)}
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          ))}

          {connecting && (
            <path
              d={getConnectionPreviewPath()}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8,4"
              opacity="0.8"
            />
          )}

          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.position.x,
              top: node.position.y,
              zIndex: 2,
            }}
          >
            <TextNode
              node={node}
              selected={selectedNode?.id === node.id}
              onSelect={() => onNodeSelect(node)}
              onMove={(position) => onNodeMove(node.id, position)}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              onConnectionDrag={handleConnectionDrag}
              connecting={connecting?.sourceId !== node.id && !!connecting}
            />
          </div>
        ))}
      </div>
    );
  }
);

FlowCanvas.displayName = "FlowCanvas";
