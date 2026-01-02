import { useState, useEffect, useCallback } from "react";
import type { TranscriptDTO } from "@/types";

interface UseTranscriptsResult {
  transcripts: TranscriptDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching transcripts for a specific thread.
 * Automatically fetches transcripts when threadId changes.
 */
export function useTranscripts(threadId: string | null): UseTranscriptsResult {
  const [transcripts, setTranscripts] = useState<TranscriptDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscripts = useCallback(async () => {
    if (!threadId) {
      setTranscripts([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/threads/${threadId}/transcripts`);

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch transcripts");
      }

      const result = await response.json();
      setTranscripts(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching transcripts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  return {
    transcripts,
    isLoading,
    error,
    refetch: fetchTranscripts,
  };
}
