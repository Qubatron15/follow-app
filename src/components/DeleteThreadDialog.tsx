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
import { useDeleteThread } from "./hooks/useDeleteThread";
import type { ThreadDTO } from "@/types";

interface DeleteThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thread: ThreadDTO | null;
  onThreadDeleted: (threadId: string) => void;
}

/**
 * DeleteThreadDialog component - Confirmation dialog for deleting a thread.
 * Shows warning about permanent deletion and handles the delete operation.
 */
export default function DeleteThreadDialog({
  isOpen,
  onClose,
  thread,
  onThreadDeleted,
}: DeleteThreadDialogProps) {
  const { deleteThread, isDeleting } = useDeleteThread();

  const handleConfirmDelete = async () => {
    if (!thread) return;

    const success = await deleteThread(thread.id);

    if (success) {
      onThreadDeleted(thread.id);
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
          <AlertDialogTitle>Czy na pewno chcesz usunąć ten wątek?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Ta akcja jest <span className="font-semibold text-destructive">nieodwracalna</span>. 
              Wątek <span className="font-semibold">&quot;{thread?.name}&quot;</span> zostanie trwale usunięty.
            </p>
            <p className="text-sm">
              Wszystkie powiązane transkrypcje i action points również zostaną usunięte.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Usuwanie..." : "Usuń wątek"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
