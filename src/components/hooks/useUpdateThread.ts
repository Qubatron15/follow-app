import { useState, useCallback } from "react";
import type { ThreadDTO, UpdateThreadCommand, ErrorResponse } from "@/types";

interface UseUpdateThreadResult {
  updateThread: (threadId: string, name: string) => Promise<ThreadDTO | null>;
  isUpdating: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for updating a thread's name.
 * Handles API communication and error management.
 */
export function useUpdateThread(): UseUpdateThreadResult {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateThread = useCallback(async (threadId: string, name: string): Promise<ThreadDTO | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const command: UpdateThreadCommand = { name };

      const response = await fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          // Redirect to login on unauthorized
          window.location.href = "/login";
          return null;
        }

        // Parse error response
        const errorData: ErrorResponse = await response.json();
        
        // Map error codes to user-friendly messages
        const errorMessage = getErrorMessage(errorData.error.code, errorData.error.message);
        setError(errorMessage);
        return null;
      }

      const result = await response.json();
      return result.data as ThreadDTO;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error updating thread:", err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateThread,
    isUpdating,
    error,
    clearError,
  };
}

/**
 * Maps error codes to user-friendly messages
 */
function getErrorMessage(code: string, defaultMessage: string): string {
  const errorMessages: Record<string, string> = {
    THREAD_NAME_INVALID: "Nazwa wątku musi mieć od 1 do 20 znaków",
    THREAD_NAME_DUPLICATE: "Wątek o tej nazwie już istnieje",
    THREAD_NOT_FOUND: "Wątek nie został znaleziony",
    VALIDATION_ERROR: "Nieprawidłowe dane wejściowe",
  };

  return errorMessages[code] || defaultMessage || "Wystąpił nieoczekiwany błąd";
}
