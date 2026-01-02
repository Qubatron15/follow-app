import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ThreadDTO } from "@/types";

/**
 * Local type for managing transcript draft state
 */
interface TranscriptDraft {
  threadId: string | null;
  transcriptId: string | null;
  content: string;
  isDirty: boolean;
}

/**
 * Context value shape for threads management
 */
interface ThreadsContextValue {
  threads: ThreadDTO[];
  activeThreadId: string | null;
  transcriptDraft: TranscriptDraft;
  isLoading: boolean;
  error: string | null;
  setThreads: (threads: ThreadDTO[]) => void;
  setActiveThreadId: (threadId: string | null) => void;
  updateTranscriptDraft: (content: string, transcriptId?: string | null, markDirty?: boolean) => void;
  markTranscriptClean: () => void;
  addThread: (thread: ThreadDTO) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Context for managing threads state across the dashboard
 */
const ThreadsContext = createContext<ThreadsContextValue | undefined>(undefined);

interface ThreadsProviderProps {
  children: ReactNode;
}

/**
 * Provider component for threads context.
 * Manages threads list, active thread, and transcript draft state.
 */
export function ThreadsProvider({ children }: ThreadsProviderProps) {
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState<TranscriptDraft>({
    threadId: null,
    transcriptId: null,
    content: "",
    isDirty: false,
  });
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Updates transcript content and optionally marks it as dirty
   */
  const updateTranscriptDraft = useCallback((content: string, transcriptId?: string | null, markDirty: boolean = true) => {
    setTranscriptDraft((prev) => ({
      ...prev,
      content,
      transcriptId: transcriptId !== undefined ? transcriptId : prev.transcriptId,
      isDirty: markDirty,
    }));
  }, []);

  /**
   * Marks transcript as clean (saved)
   */
  const markTranscriptClean = useCallback(() => {
    setTranscriptDraft((prev) => ({
      ...prev,
      isDirty: false,
    }));
  }, []);

  /**
   * Adds a new thread to the list and sets it as active
   */
  const addThread = useCallback((thread: ThreadDTO) => {
    setThreads((prev) => [...prev, thread]);
    setActiveThreadId(thread.id);
  }, []);

  /**
   * Sets active thread and updates transcript draft context
   */
  const handleSetActiveThreadId = useCallback((threadId: string | null) => {
    setActiveThreadId(threadId);
    // Reset transcript draft when switching threads
    setTranscriptDraft({
      threadId,
      transcriptId: null,
      content: "",
      isDirty: false,
    });
  }, []);

  const value: ThreadsContextValue = {
    threads,
    activeThreadId,
    transcriptDraft,
    isLoading,
    error,
    setThreads,
    setActiveThreadId: handleSetActiveThreadId,
    updateTranscriptDraft,
    markTranscriptClean,
    addThread,
    setLoading,
    setError,
  };

  return (
    <ThreadsContext.Provider value={value}>
      {children}
    </ThreadsContext.Provider>
  );
}

/**
 * Hook to access threads context.
 * Must be used within ThreadsProvider.
 */
export function useThreadsContext(): ThreadsContextValue {
  const context = useContext(ThreadsContext);
  
  if (context === undefined) {
    throw new Error("useThreadsContext must be used within ThreadsProvider");
  }
  
  return context;
}
