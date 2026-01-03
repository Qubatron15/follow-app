import { useState, useId } from "react";
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
import { useCreateThread } from "./hooks/useCreateThread";
import type { ThreadDTO } from "@/types";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThreadCreated: (thread: ThreadDTO) => void;
}

/**
 * CreateThreadModal component - Modal for creating a new thread.
 * Includes form validation and error handling.
 */
export default function CreateThreadModal({ isOpen, onClose, onThreadCreated }: CreateThreadModalProps) {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { createThread, isCreating, error: apiError, clearError } = useCreateThread();

  const nameInputId = useId();
  const errorId = useId();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    // Call API to create thread
    const newThread = await createThread(trimmedName);

    if (newThread) {
      // Success - reset form and notify parent
      setName("");
      setValidationError(null);
      onThreadCreated(newThread);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setName("");
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
          <DialogTitle>Utwórz nowy wątek</DialogTitle>
          <DialogDescription>Nadaj nazwę swojemu wątkowi. Możesz ją później zmienić.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={nameInputId}>
                Nazwa wątku
                <span className="text-destructive ml-1" aria-label="wymagane">
                  *
                </span>
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
                disabled={isCreating}
                autoFocus
              />

              {/* Character counter */}
              <p className={`text-xs ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">
                {remainingChars >= 0
                  ? `Pozostało ${remainingChars} znaków`
                  : `Przekroczono limit o ${Math.abs(remainingChars)} znaków`}
              </p>

              {/* Error message */}
              {displayError && (
                <p id={errorId} className="text-sm text-destructive" role="alert">
                  {displayError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isCreating || name.trim().length === 0 || isOverLimit}>
              {isCreating ? "Tworzenie..." : "Utwórz wątek"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
