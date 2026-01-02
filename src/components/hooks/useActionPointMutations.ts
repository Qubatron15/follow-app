import { useState, useCallback } from "react";
import type { ActionPointDTO, UpdateActionPointCommand } from "@/types";

interface UseActionPointMutationsResult {
  createActionPoint: (threadId: string, title: string, isCompleted?: boolean) => Promise<ActionPointDTO | null>;
  updateActionPoint: (apId: string, updates: UpdateActionPointCommand) => Promise<ActionPointDTO | null>;
  deleteActionPoint: (apId: string) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for action point mutations (create, update, delete).
 */
export function useActionPointMutations(): UseActionPointMutationsResult {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createActionPoint = useCallback(
    async (threadId: string, title: string, isCompleted: boolean = false): Promise<ActionPointDTO | null> => {
      setIsCreating(true);
      setError(null);

      try {
        // Send in camelCase format expected by Zod schema
        const command = {
          title,
          isCompleted,
        };

        const response = await fetch(`/api/threads/${threadId}/action-points`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return null;
          }

          const errorData = await response.json();
          const errorMessage = errorData.error?.message || "Failed to create action point";
          setError(errorMessage);
          return null;
        }

        const result = await response.json();
        return result.data as ActionPointDTO;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error creating action point:", err);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateActionPoint = useCallback(
    async (apId: string, updates: UpdateActionPointCommand): Promise<ActionPointDTO | null> => {
      setIsUpdating(true);
      setError(null);

      try {
        // Map to API format (camelCase for validation, then converted to snake_case in service)
        const command: Record<string, unknown> = {};
        if (updates.title !== undefined) {
          command.title = updates.title;
        }
        if (updates.is_completed !== undefined) {
          command.isCompleted = updates.is_completed;
        }

        const response = await fetch(`/api/action-points/${apId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return null;
          }

          const errorData = await response.json();
          const errorMessage = errorData.error?.message || "Failed to update action point";
          setError(errorMessage);
          return null;
        }

        const result = await response.json();
        return result.data as ActionPointDTO;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error updating action point:", err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deleteActionPoint = useCallback(async (apId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/action-points/${apId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return false;
        }

        const errorData = await response.json();
        const errorMessage = errorData.error?.message || "Failed to delete action point";
        setError(errorMessage);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error deleting action point:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createActionPoint,
    updateActionPoint,
    deleteActionPoint,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    clearError,
  };
}
