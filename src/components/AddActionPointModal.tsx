import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useActionPointMutations } from "@/components/hooks/useActionPointMutations";
import { semanticColors } from "@/lib/palette";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: "rgba(34, 56, 67, 0.7)" }}
      onClick={handleClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        style={{ backgroundColor: semanticColors.backgroundElevated }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold" style={{ color: semanticColors.textPrimary }}>
            Dodaj Action Point
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            style={{
              color: semanticColors.textSecondary,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isCreating) {
                e.currentTarget.style.backgroundColor = semanticColors.backgroundSubtle;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="ap-title"
              className="block text-sm font-semibold mb-2"
              style={{ color: semanticColors.textPrimary }}
            >
              Treść Action Point
            </label>
            <textarea
              id="ap-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wpisz treść zadania..."
              className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none transition-all"
              style={{
                border: `2px solid ${semanticColors.border}`,
                backgroundColor: semanticColors.background,
                color: semanticColors.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = semanticColors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = semanticColors.border;
              }}
              rows={3}
              maxLength={255}
              disabled={isCreating}
              required
              data-testid="add-action-point-title-input"
            />
            <p className="text-xs font-medium mt-2" style={{ color: semanticColors.textMuted }}>
              {title.length}/255 znaków
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ap-completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              disabled={isCreating}
              className="w-5 h-5 rounded-md cursor-pointer"
              style={{
                accentColor: semanticColors.primary,
              }}
              data-testid="add-action-point-completed-checkbox"
            />
            <label
              htmlFor="ap-completed"
              className="text-sm font-medium cursor-pointer"
              style={{ color: semanticColors.textPrimary }}
            >
              Oznacz jako wykonane
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{
                border: `2px solid ${semanticColors.border}`,
                color: semanticColors.textPrimary,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isCreating) {
                  e.currentTarget.style.backgroundColor = semanticColors.backgroundSubtle;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isCreating || title.trim().length === 0}
              className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: semanticColors.primary,
                color: semanticColors.textOnPrimary,
              }}
              onMouseEnter={(e) => {
                if (!isCreating && title.trim().length > 0) {
                  e.currentTarget.style.backgroundColor = semanticColors.primaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isCreating) {
                  e.currentTarget.style.backgroundColor = semanticColors.primary;
                }
              }}
              data-testid="add-action-point-submit-button"
            >
              {isCreating ? "Dodawanie..." : "Dodaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
