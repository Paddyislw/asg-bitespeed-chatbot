/**
 * Type definitions for the flow builder
 * These types define the structure of nodes and edges in the chatbot flow
 */

export interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    text: string
    [key: string]: any // Allow for additional properties for different node types
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
}

// Future node types can extend this base interface
export interface BaseNodeData {
  [key: string]: any
}

export interface TextNodeData extends BaseNodeData {
  text: string
}

// Future node data types:
// export interface ConditionNodeData extends BaseNodeData {
//   condition: string
//   trueLabel: string
//   falseLabel: string
// }

// export interface ApiNodeData extends BaseNodeData {
//   url: string
//   method: string
//   headers: Record<string, string>
// }
