

import type React from "react"

import { MessageSquare } from "lucide-react"

interface NodesPanelProps {
  onDragStart: (nodeType: string) => void
}

/**
 * NodesPanel component - displays available node types that can be dragged to the flow
 * This panel is designed to be extensible - new node types can be easily added here
 * Currently supports only Message nodes, but can be extended for other node types
 */
export function NodesPanel({ onDragStart }: NodesPanelProps) {
  // Handle drag start for node creation
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", nodeType) // Add this for better compatibility
    onDragStart(nodeType)
  }

  return (
    <div className="p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Nodes Panel</h3>

      {/* Available node types - currently only Message node */}
      <div className="space-y-3">
        {/* Message Node - draggable */}
        <div
          className="
            border-2 border-dashed border-blue-300 rounded-lg p-4 
            cursor-grab active:cursor-grabbing hover:border-blue-400
            transition-colors duration-200 bg-blue-50 hover:bg-blue-100
          "
          draggable
          onDragStart={(event) => handleDragStart(event, "textNode")}
        >
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <MessageSquare size={24} />
            <span className="font-medium">Message</span>
          </div>
        </div>
      </div>

      {/* Instructions for users */}
      <div className="mt-6 text-sm text-gray-600">
        <p>Drag and drop nodes to the canvas to build your chatbot flow.</p>
      </div>
    </div>
  )
}
