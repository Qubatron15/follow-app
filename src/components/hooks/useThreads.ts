import { useState, useEffect, useCallback } from "react";
import type { ThreadDTO } from "@/types";

interface UseThreadsResult {
  data: ThreadDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing threads.
 * Automatically fetches threads on mount and provides a refetch function.
 */
export function useThreads(): UseThreadsResult {
  const [data, setData] = useState<ThreadDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/threads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          // Redirect to login on unauthorized
          window.location.href = "/login";
          return;
        }

        throw new Error(`Failed to fetch threads: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching threads:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch threads on mount
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchThreads,
  };
}
