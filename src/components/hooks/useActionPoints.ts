import { useState, useEffect, useCallback } from "react";
import type { ActionPointDTO } from "@/types";

interface UseActionPointsResult {
  actionPoints: ActionPointDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching action points for a specific thread.
 * Automatically fetches action points when threadId changes.
 */
export function useActionPoints(threadId: string | null): UseActionPointsResult {
  const [actionPoints, setActionPoints] = useState<ActionPointDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActionPoints = useCallback(async () => {
    if (!threadId) {
      setActionPoints([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/threads/${threadId}/action-points`);

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch action points");
      }

      const result = await response.json();
      setActionPoints(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching action points:", err);
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchActionPoints();
  }, [fetchActionPoints]);

  return {
    actionPoints,
    isLoading,
    error,
    refetch: fetchActionPoints,
  };
}
