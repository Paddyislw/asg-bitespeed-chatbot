

import type React from "react";

import { useState, useCallback, useRef } from "react";
import { FlowCanvas } from "@/components/FlowCanvas";
import { NodesPanel } from "@/components/panels/NodesPanel";
import { SettingsPanel } from "@/components/panels/SettingsPanel";
import { SaveButton } from "@/components/SaveButton";
import { ErrorToast } from "@/components/ErrorToast";
import type { FlowNode, FlowEdge } from "@/types/flow";

// Initial nodes for demonstration - these will be displayed when the app loads
const initialNodes: FlowNode[] = [
  {
    id: "1",
    type: "textNode",
    position: { x: 100, y: 100 },
    data: { text: "test message 1" },
  },
  {
    id: "2",
    type: "textNode",
    position: { x: 400, y: 100 },
    data: { text: "test message 2" },
  },
];

// Initial edges connecting the nodes - shows how nodes can be connected
const initialEdges: FlowEdge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
  },
];

/**
 * Main ChatbotFlowBuilder component
 * This is the root component that manages the entire flow builder application
 * It handles state management for nodes, edges, selection, and user interactions
 */
export default function App() {
  // Flow state management
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  // Canvas reference for drop handling and positioning calculations
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle node selection for the settings panel
  const handleNodeSelect = useCallback((node: FlowNode) => {
    setSelectedNode(node);
  }, []);

  // Handle clicking on empty space to deselect nodes
  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handle drag and drop of new nodes from the nodes panel
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle dropping new nodes onto the canvas
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!draggedNodeType || !canvasRef.current) return;

      // Calculate drop position relative to canvas
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: Math.max(0, event.clientX - rect.left - 100), // Offset to center the node
        y: Math.max(0, event.clientY - rect.top - 50),
      };

      // Create a new node with a unique ID
      const newNode: FlowNode = {
        id: `node_${Date.now()}`,
        type: draggedNodeType,
        position,
        data: { text: "New message" },
      };

      setNodes((prev) => [...prev, newNode]);
      setDraggedNodeType(null);
    },
    [draggedNodeType]
  );

  // Handle node position updates when nodes are dragged around the canvas
  const handleNodeMove = useCallback(
    (nodeId: string, newPosition: { x: number; y: number }) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, position: newPosition } : node
        )
      );

      // Update selected node if it's the one being moved
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode({ ...selectedNode, position: newPosition });
      }
    },
    [selectedNode]
  );

  // Handle creating connections between nodes
  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    const newEdge: FlowEdge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    };

    setEdges((prev) => {
      // Remove any existing edge from the same source (only one edge per source handle)
      const filteredEdges = prev.filter((edge) => edge.source !== sourceId);
      return [...filteredEdges, newEdge];
    });
  }, []);

  // Update node data when edited in settings panel
  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );

      // Update selected node to reflect changes
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, ...newData },
        });
      }
    },
    [selectedNode]
  );

  // Validate and save the flow
  const handleSave = useCallback(() => {
    // Clear any existing errors
    setError(null);

    // Validation: Check if there are more than one nodes and more than one node has empty target handles
    if (nodes.length > 1) {
      const nodesWithoutIncomingEdges = nodes.filter(
        (node) => !edges.some((edge) => edge.target === node.id)
      );

      if (nodesWithoutIncomingEdges.length > 1) {
        setError("Cannot save Flow");
        return;
      }
    }

    // If validation passes, save the flow
    console.log("Flow saved successfully!", { nodes, edges });
    alert("Flow saved successfully!");
  }, [nodes, edges]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main flow builder area */}
      <div className="flex-1 relative">
        <FlowCanvas
          ref={canvasRef}
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onNodeSelect={handleNodeSelect}
          onCanvasClick={handleCanvasClick}
          onNodeMove={handleNodeMove}
          onConnect={handleConnect}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        {/* Save button positioned at top right */}
        <div className="absolute top-4 right-4 z-10">
          <SaveButton onSave={handleSave} />
        </div>

        {/* Error toast for validation errors */}
        {error && (
          <div className="absolute top-16 right-4 z-10">
            <ErrorToast message={error} onClose={() => setError(null)} />
          </div>
        )}
      </div>

      {/* Right sidebar - either nodes panel or settings panel */}
      <div className="w-80 border-l border-gray-200 bg-white">
        {selectedNode ? (
          <SettingsPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        ) : (
          <NodesPanel onDragStart={setDraggedNodeType} />
        )}
      </div>
    </div>
  );
}
