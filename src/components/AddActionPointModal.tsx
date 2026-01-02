import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useActionPointMutations } from "@/components/hooks/useActionPointMutations";

interface AddActionPointModalProps {
  threadId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

/**
 * Modal for adding a new action point manually.
 * Implements US-008 from PRD.
 */
export default function AddActionPointModal({ threadId, isOpen, onClose, onSuccess }: AddActionPointModalProps) {
  const [title, setTitle] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const { createActionPoint, isCreating } = useActionPointMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length === 0) {
      toast.error("Błąd", {
        description: "Tytuł nie może być pusty.",
      });
      return;
    }

    const created = await createActionPoint(threadId, title, isCompleted);

    if (created) {
      await onSuccess();
      setTitle("");
      setIsCompleted(false);
      onClose();
      toast.success("Dodano", {
        description: "Action Point został dodany.",
      });
    } else {
      toast.error("Błąd", {
        description: "Nie udało się dodać Action Point.",
      });
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle("");
      setIsCompleted(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Dodaj Action Point</h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ap-title" className="block text-sm font-medium mb-2">
              Treść Action Point
            </label>
            <textarea
              id="ap-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wpisz treść zadania..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              maxLength={255}
              disabled={isCreating}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/255 znaków</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ap-completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              disabled={isCreating}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="ap-completed" className="text-sm">
              Oznacz jako wykonane
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isCreating || title.trim().length === 0}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Dodawanie..." : "Dodaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
