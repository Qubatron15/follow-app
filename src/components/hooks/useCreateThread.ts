import { useState, useCallback } from "react";
import type { ThreadDTO, CreateThreadCommand, ErrorResponse } from "@/types";

interface UseCreateThreadResult {
  createThread: (name: string) => Promise<ThreadDTO | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for creating a new thread.
 * Handles optimistic UI updates and error management.
 */
export function useCreateThread(): UseCreateThreadResult {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createThread = useCallback(async (name: string): Promise<ThreadDTO | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const command: CreateThreadCommand = { name };

      const response = await fetch("/api/threads", {
        method: "POST",
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
      console.error("Error creating thread:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createThread,
    isCreating,
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
    THREAD_LIMIT_REACHED: "Osiągnięto limit 20 wątków",
    VALIDATION_ERROR: "Nieprawidłowe dane wejściowe",
  };

  return errorMessages[code] || defaultMessage || "Wystąpił nieoczekiwany błąd";
}
