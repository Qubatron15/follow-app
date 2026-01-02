import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActionPointMutations } from "./hooks/useActionPointMutations";
import type { ActionPointDTO } from "@/types";

interface DeleteActionPointDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actionPoint: ActionPointDTO | null;
  onActionPointDeleted: () => void;
}

/**
 * DeleteActionPointDialog component - Confirmation dialog for deleting an action point.
 * Shows warning about permanent deletion and handles the delete operation.
 */
export default function DeleteActionPointDialog({
  isOpen,
  onClose,
  actionPoint,
  onActionPointDeleted,
}: DeleteActionPointDialogProps) {
  const { deleteActionPoint, isDeleting } = useActionPointMutations();

  const handleConfirmDelete = async () => {
    if (!actionPoint) return;

    const success = await deleteActionPoint(actionPoint.id);

    if (success) {
      onActionPointDeleted();
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć ten Action Point?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Ta akcja jest <span className="font-semibold text-destructive">nieodwracalna</span>. Action Point{" "}
              <span className="font-semibold">&quot;{actionPoint?.title}&quot;</span> zostanie trwale usunięty.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Usuwanie..." : "Usuń Action Point"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
