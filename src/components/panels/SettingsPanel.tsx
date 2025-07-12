

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import type { FlowNode } from "@/types/flow"

interface SettingsPanelProps {
  node: FlowNode
  onUpdateNode: (nodeId: string, newData: any) => void
  onClose: () => void
}

/**
 * SettingsPanel component - allows editing of selected node properties
 * Currently supports text editing for message nodes
 * Designed to be extensible for different node types
 */
export function SettingsPanel({ node, onUpdateNode, onClose }: SettingsPanelProps) {
  const [text, setText] = useState(node.data.text || "")

  // Update local state when node changes
  useEffect(() => {
    setText(node.data.text || "")
  }, [node.data.text])

  // Handle text changes and update the node
  const handleTextChange = (newText: string) => {
    setText(newText)
    onUpdateNode(node.id, { text: newText })
  }

  return (
    <div className="p-4 h-full">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Message</h3>
      </div>

      {/* Settings form based on node type */}
      <div className="space-y-4">
        {node.type === "textNode" && (
          <>
            <div>
              <label htmlFor="message-text" className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                id="message-text"
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter your message..."
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Additional settings can be added here for text nodes */}
            <div className="text-xs text-gray-500 mt-4">
              <p>Node ID: {node.id}</p>
              <p>
                Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
