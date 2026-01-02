import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { ActionPointDTO } from "@/types";
import { useActionPointMutations } from "@/components/hooks/useActionPointMutations";
import { semanticColors } from "@/lib/palette";
import DeleteActionPointDialog from "@/components/DeleteActionPointDialog";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [actionPointToDelete, setActionPointToDelete] = useState<ActionPointDTO | null>(null);
  const { updateActionPoint, isUpdating, isDeleting } = useActionPointMutations();

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

  const handleOpenDeleteDialog = (ap: ActionPointDTO) => {
    setActionPointToDelete(ap);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setActionPointToDelete(null);
  };

  const handleActionPointDeleted = async () => {
    await onRefetch();
    toast.success("Usunięto", {
      description: "Action Point został usunięty.",
    });
    handleCloseDeleteDialog();
  };

  if (actionPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <div className="text-7xl mb-5">📋</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: semanticColors.textPrimary }}>
            Brak Action Points
          </h3>
          <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
            Dodaj pierwszy Action Point, aby rozpocząć śledzenie zadań.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionPoints.map((ap) => (
        <div
          key={ap.id}
          className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          style={{
            backgroundColor: ap.isCompleted ? semanticColors.backgroundSubtle : semanticColors.backgroundElevated,
            border: `2px solid ${ap.isCompleted ? semanticColors.border : semanticColors.borderSubtle}`,
          }}
        >
          {/* Checkbox for completion status */}
          <button
            onClick={() => handleToggleCompleted(ap)}
            disabled={isUpdating || isDeleting}
            className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: ap.isCompleted ? semanticColors.primary : "transparent",
              border: `2px solid ${ap.isCompleted ? semanticColors.primary : semanticColors.textMuted}`,
            }}
            onMouseEnter={(e) => {
              if (!ap.isCompleted && !isUpdating && !isDeleting) {
                e.currentTarget.style.borderColor = semanticColors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!ap.isCompleted) {
                e.currentTarget.style.borderColor = semanticColors.textMuted;
              }
            }}
            aria-label={ap.isCompleted ? "Oznacz jako niewykonane" : "Oznacz jako wykonane"}
          >
            {ap.isCompleted && <Check className="w-4 h-4" style={{ color: semanticColors.textOnPrimary }} />}
          </button>

          {/* Title (editable or display) */}
          <div className="flex-1 min-w-0">
            {editingId === ap.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
                style={{
                  border: `2px solid ${semanticColors.primary}`,
                  backgroundColor: semanticColors.backgroundElevated,
                  color: semanticColors.textPrimary,
                }}
                maxLength={255}
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
                className="text-sm break-words leading-relaxed"
                style={{
                  color: ap.isCompleted ? semanticColors.textMuted : semanticColors.textPrimary,
                  textDecoration: ap.isCompleted ? "line-through" : "none",
                }}
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
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    color: semanticColors.success,
                    backgroundColor: "#f0fdf4",
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) {
                      e.currentTarget.style.backgroundColor = "#dcfce7";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                  }}
                  aria-label="Zapisz"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    color: semanticColors.textSecondary,
                    backgroundColor: semanticColors.backgroundSubtle,
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) {
                      e.currentTarget.style.backgroundColor = semanticColors.border;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = semanticColors.backgroundSubtle;
                  }}
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
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    color: semanticColors.accent,
                    backgroundColor: "#fef3e7",
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating && !isDeleting) {
                      e.currentTarget.style.backgroundColor = "#fde8cc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef3e7";
                  }}
                  aria-label="Edytuj"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDeleteDialog(ap)}
                  disabled={isUpdating || isDeleting}
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    color: semanticColors.error,
                    backgroundColor: "#fef2f2",
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating && !isDeleting) {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                  }}
                  aria-label="Usuń"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <DeleteActionPointDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        actionPoint={actionPointToDelete}
        onActionPointDeleted={handleActionPointDeleted}
      />
    </div>
  );
}
