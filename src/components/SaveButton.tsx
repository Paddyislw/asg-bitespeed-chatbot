

interface SaveButtonProps {
  onSave: () => void
}

/**
 * SaveButton component - handles saving the chatbot flow
 * Positioned at the top right of the interface
 * Triggers flow validation before saving
 */
export function SaveButton({ onSave }: SaveButtonProps) {
  return (
    <button
      onClick={onSave}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
    >
      Save Changes
    </button>
  )
}
