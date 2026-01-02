import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { ActionPointDTO } from "@/types";
import { useActionPointMutations } from "@/components/hooks/useActionPointMutations";

interface ActionPointsListProps {
  actionPoints: ActionPointDTO[];
  onRefetch: () => Promise<void>;
}

/**
 * Component displaying a list of action points with CRUD operations.
 * Implements US-006, US-007, US-009 from PRD.
 */
export default function ActionPointsList({ actionPoints, onRefetch }: ActionPointsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const { updateActionPoint, deleteActionPoint, isUpdating, isDeleting } = useActionPointMutations();

  const handleStartEdit = (ap: ActionPointDTO) => {
    setEditingId(ap.id);
    setEditTitle(ap.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleSaveEdit = async (apId: string) => {
    if (editTitle.trim().length === 0) {
      toast.error("Błąd", {
        description: "Tytuł nie może być pusty.",
      });
      return;
    }

    const updated = await updateActionPoint(apId, { title: editTitle });

    if (updated) {
      await onRefetch();
      setEditingId(null);
      setEditTitle("");
      toast.success("Zaktualizowano", {
        description: "Action Point został zaktualizowany.",
      });
    } else {
      toast.error("Błąd", {
        description: "Nie udało się zaktualizować Action Point.",
      });
    }
  };

  const handleToggleCompleted = async (ap: ActionPointDTO) => {
    const updated = await updateActionPoint(ap.id, { is_completed: !ap.isCompleted });

    if (updated) {
      await onRefetch();
      toast.success(updated.isCompleted ? "Oznaczono jako wykonane" : "Oznaczono jako niewykonane");
    } else {
      toast.error("Błąd", {
        description: "Nie udało się zmienić statusu.",
      });
    }
  };

  const handleDelete = async (apId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten Action Point? Tej operacji nie można cofnąć.")) {
      return;
    }

    const success = await deleteActionPoint(apId);

    if (success) {
      await onRefetch();
      toast.success("Usunięto", {
        description: "Action Point został usunięty.",
      });
    } else {
      toast.error("Błąd", {
        description: "Nie udało się usunąć Action Point.",
      });
    }
  };

  if (actionPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8">
        <div>
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Brak Action Points</h3>
          <p className="text-sm">Dodaj pierwszy Action Point, aby rozpocząć śledzenie zadań.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actionPoints.map((ap) => (
        <div
          key={ap.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border transition-colors
            ${ap.isCompleted ? "bg-muted/50 border-muted" : "bg-background border-border"}
          `}
        >
          {/* Checkbox for completion status */}
          <button
            onClick={() => handleToggleCompleted(ap)}
            disabled={isUpdating || isDeleting}
            className={`
              mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all
              ${ap.isCompleted ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"}
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center
            `}
            aria-label={ap.isCompleted ? "Oznacz jako niewykonane" : "Oznacz jako wykonane"}
          >
            {ap.isCompleted && <Check className="w-3 h-3 text-primary-foreground" />}
          </button>

          {/* Title (editable or display) */}
          <div className="flex-1 min-w-0">
            {editingId === ap.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={255}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit(ap.id);
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
            ) : (
              <p
                className={`
                  text-sm break-words
                  ${ap.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}
                `}
              >
                {ap.title}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {editingId === ap.id ? (
              <>
                <button
                  onClick={() => handleSaveEdit(ap.id)}
                  disabled={isUpdating}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                  aria-label="Zapisz"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="p-1.5 text-muted-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
                  aria-label="Anuluj"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleStartEdit(ap)}
                  disabled={isUpdating || isDeleting}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                  aria-label="Edytuj"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ap.id)}
                  disabled={isUpdating || isDeleting}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  aria-label="Usuń"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
