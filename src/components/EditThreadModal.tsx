import { useState, useId, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUpdateThread } from "./hooks/useUpdateThread";
import type { ThreadDTO } from "@/types";

interface EditThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: ThreadDTO | null;
  onThreadUpdated: (thread: ThreadDTO) => void;
}

/**
 * EditThreadModal component - Modal for editing a thread's name.
 * Includes form validation and error handling.
 */
export default function EditThreadModal({
  isOpen,
  onClose,
  thread,
  onThreadUpdated,
}: EditThreadModalProps) {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { updateThread, isUpdating, error: apiError, clearError } = useUpdateThread();
  
  const nameInputId = useId();
  const errorId = useId();

  // Initialize name when thread changes
  useEffect(() => {
    if (thread) {
      setName(thread.name);
    }
  }, [thread]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!thread) return;
    
    // Clear previous errors
    setValidationError(null);
    clearError();

    // Client-side validation
    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      setValidationError("Nazwa wątku nie może być pusta");
      return;
    }

    if (trimmedName.length > 20) {
      setValidationError("Nazwa wątku nie może być dłuższa niż 20 znaków");
      return;
    }

    // Check if name actually changed
    if (trimmedName === thread.name) {
      handleClose();
      return;
    }

    // Call API to update thread
    const updatedThread = await updateThread(thread.id, trimmedName);

    if (updatedThread) {
      // Success - reset form and notify parent
      setName("");
      setValidationError(null);
      onThreadUpdated(updatedThread);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    if (thread) {
      setName(thread.name);
    }
    setValidationError(null);
    clearError();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const displayError = validationError || apiError;
  const remainingChars = 20 - name.length;
  const isOverLimit = name.length > 20;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj wątek</DialogTitle>
          <DialogDescription>
            Zmień nazwę wątku. Nazwa musi być unikalna.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={nameInputId}>
                Nazwa wątku
                <span className="text-destructive ml-1" aria-label="wymagane">*</span>
              </Label>
              <Input
                id={nameInputId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Spotkanie zespołu"
                maxLength={21}
                aria-invalid={!!displayError}
                aria-describedby={displayError ? errorId : undefined}
                disabled={isUpdating}
                autoFocus
              />
              
              {/* Character counter */}
              <p
                className={`text-xs ${
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                }`}
                aria-live="polite"
              >
                {remainingChars >= 0
                  ? `Pozostało ${remainingChars} znaków`
                  : `Przekroczono limit o ${Math.abs(remainingChars)} znaków`}
              </p>

              {/* Error message */}
              {displayError && (
                <p
                  id={errorId}
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {displayError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || name.trim().length === 0 || isOverLimit}
            >
              {isUpdating ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
