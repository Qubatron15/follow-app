import { useState, useCallback } from "react";
import type { ErrorResponse } from "@/types";

interface UseDeleteThreadResult {
  deleteThread: (threadId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for deleting a thread.
 * Handles API communication and error management.
 */
export function useDeleteThread(): UseDeleteThreadResult {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          // Redirect to login on unauthorized
          window.location.href = "/login";
          return false;
        }

        // For DELETE, we might get error responses
        if (response.status !== 204) {
          try {
            const errorData: ErrorResponse = await response.json();
            const errorMessage = errorData.error.message || "Failed to delete thread";
            setError(errorMessage);
          } catch {
            setError("Failed to delete thread");
          }
        }
        return false;
      }

      // Success - 204 No Content
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error deleting thread:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deleteThread,
    isDeleting,
    error,
    clearError,
  };
}
