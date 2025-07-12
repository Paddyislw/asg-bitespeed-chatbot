"use client";

import type React from "react";
import { useState, useRef } from "react";
import { MessageSquare } from "lucide-react";
import type { FlowNode } from "@/types/flow";

interface TextNodeProps {
  node: FlowNode;
  selected: boolean;
  onSelect: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onConnectionStart: (
    nodeId: string,
    handlePosition: { x: number; y: number }
  ) => void;
  onConnectionEnd: (targetNodeId: string) => void;
  onConnectionDrag: (position: { x: number; y: number }) => void;
  connecting: boolean;
}

export function TextNode({
  node,
  selected,
  onSelect,
  onMove,
  onConnectionStart,
  onConnectionEnd,
  connecting,
}: TextNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  //Node dragging
  const handleNodeMouseDown = (event: React.MouseEvent) => {
    // If the user clicks on a handle, don't start dragging
    if ((event.target as HTMLElement).closest(".handle")) {
      return; // Don't drag node if clicking on handle
    }

    event.preventDefault();
    setIsDragging(true);
    onSelect();

    // Store initial positions
    const startX = event.clientX;
    const startY = event.clientY;
    const startNodeX = node.position.x;
    const startNodeY = node.position.y;

    // When mouse moves, update the node position
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      onMove({
        x: Math.max(0, startNodeX + deltaX), // Prevent moving to negative position
        y: Math.max(0, startNodeY + deltaY),
      });
    };

    // Stop dragging when mouse is released
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Start connection when user clicks the source handle
  const startConnection = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!nodeRef.current) return;

    const rect = nodeRef.current.getBoundingClientRect();
    const canvas = document.querySelector(".flow-canvas");
    const canvasRect = canvas?.getBoundingClientRect();

    if (!canvasRect) return;

    // Calculate position for the starting point of the connection line
    const handlePosition = {
      x: rect.right - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top,
    };

    // Start connection immediately
    onConnectionStart(node.id, handlePosition);
  };

  // Highlight the target handle when another node is trying to connect
  const handleTargetMouseEnter = () => {
    if (connecting) {
      const targetHandle = nodeRef.current?.querySelector(
        ".target-handle"
      ) as HTMLElement;
      if (targetHandle) {
        targetHandle.style.backgroundColor = "#10b981";
        targetHandle.style.transform = "translate(-50%, -50%) scale(1.3)";
      }
    }
  };

  // Reset the target handle style on mouse leave
  const handleTargetMouseLeave = () => {
    const targetHandle = nodeRef.current?.querySelector(
      ".target-handle"
    ) as HTMLElement;
    if (targetHandle) {
      targetHandle.style.backgroundColor = "";
      targetHandle.style.transform = "translate(-50%, -50%) scale(1)";
    }
  };

  // When mouse is released over the target handle, complete the connection
  const handleTargetMouseUp = () => {
    if (connecting) {
      onConnectionEnd(node.id);
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`
        bg-teal-100 border-2 rounded-lg p-3 w-[200px] shadow-sm relative select-none
        ${selected ? "border-teal-500 shadow-md" : "border-teal-200"}
        ${isDragging ? "opacity-80 cursor-grabbing" : "cursor-grab"}
        ${connecting ? "ring-2 ring-blue-300" : ""}
      `}
      onMouseDown={handleNodeMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) {
          onSelect();
        }
      }}
    >
      {/* Target handle */}
      <div
        className="handle target-handle absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                   w-4 h-4 bg-gray-500 border-2 border-white rounded-full cursor-pointer
                   hover:bg-green-500 hover:scale-110 transition-all z-30"
        data-node-id={node.id}
        onMouseEnter={handleTargetMouseEnter}
        onMouseLeave={handleTargetMouseLeave}
        onMouseUp={handleTargetMouseUp}
        title="Drop connection here"
      />

      {/* Node content */}
      <div className="flex items-center gap-2 mb-2 text-teal-700 pointer-events-none">
        <MessageSquare size={16} />
        <span className="font-medium text-sm">Send Message</span>
      </div>

      <div className="bg-white rounded p-2 text-sm text-gray-700 border min-h-[40px] pointer-events-none">
        {node.data.text || "Empty message"}
      </div>

      {/* Source handle - simplified */}
      <div
        className="handle source-handle absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2
                   w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-grab
                   hover:bg-blue-600 hover:scale-110 transition-all z-30"
        onMouseDown={startConnection}
        title="Drag to connect"
      />
    </div>
  );
}
