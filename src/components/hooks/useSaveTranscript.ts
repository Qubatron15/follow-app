import { useState, useCallback } from "react";
import type { TranscriptDTO, CreateTranscriptCommand, UpdateTranscriptCommand } from "@/types";

interface UseSaveTranscriptResult {
  saveTranscript: (threadId: string, content: string, existingTranscriptId?: string) => Promise<TranscriptDTO | null>;
  isSaving: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for saving (creating or updating) transcripts.
 * Handles both create and update operations based on whether transcriptId is provided.
 */
export function useSaveTranscript(): UseSaveTranscriptResult {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const saveTranscript = useCallback(
    async (threadId: string, content: string, existingTranscriptId?: string): Promise<TranscriptDTO | null> => {
      setIsSaving(true);
      setError(null);

      try {
        let response: Response;

        if (existingTranscriptId) {
          // Update existing transcript
          const command: UpdateTranscriptCommand = { content };

          response = await fetch(`/api/transcripts/${existingTranscriptId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
          });
        } else {
          // Create new transcript
          const command: CreateTranscriptCommand = { content };

          response = await fetch(`/api/threads/${threadId}/transcripts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
          });
        }

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return null;
          }

          const errorData = await response.json();
          const errorMessage = errorData.error?.message || "Failed to save transcript";
          setError(errorMessage);
          return null;
        }

        const result = await response.json();
        return result.data as TranscriptDTO;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error saving transcript:", err);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    saveTranscript,
    isSaving,
    error,
    clearError,
  };
}
