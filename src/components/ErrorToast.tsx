

import { X } from "lucide-react"

interface ErrorToastProps {
  message: string
  onClose: () => void
}

/**
 * ErrorToast component - displays validation errors
 * Shows when flow validation fails (e.g., multiple nodes with empty target handles)
 * Can be dismissed by clicking the X button
 */
export function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[200px]">
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-red-200 text-red-700 rounded transition-colors">
        <X size={16} />
      </button>
    </div>
  )
}
