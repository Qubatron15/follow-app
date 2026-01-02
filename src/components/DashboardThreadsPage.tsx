import { useEffect } from "react";
import { toast } from "sonner";
import { ThreadsProvider, useThreadsContext } from "@/components/hooks/useThreadsContext";
import { useThreads } from "@/components/hooks/useThreads";
import ThreadTabs from "@/components/ThreadTabs";
import TextareaTranscript from "@/components/TextareaTranscript";
import ControlsBar from "@/components/ControlsBar";
import SpinnerOverlay from "@/components/SpinnerOverlay";
import type { ThreadDTO } from "@/types";

/**
 * Inner component that uses the context
 */
function DashboardThreadsContent() {
  const {
    threads,
    activeThreadId,
    transcriptDraft,
    isLoading,
    error,
    setThreads,
    setActiveThreadId,
    updateTranscriptDraft,
    setLoading,
    setError,
  } = useThreadsContext();

  const { data: fetchedThreads, isLoading: isFetching, error: fetchError, refetch } = useThreads();

  // Update context when threads are fetched
  useEffect(() => {
    if (fetchedThreads.length > 0) {
      setThreads(fetchedThreads);
      // Set first thread as active if none selected
      if (!activeThreadId && fetchedThreads.length > 0) {
        setActiveThreadId(fetchedThreads[0].id);
      }
    }
    setLoading(isFetching);
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchedThreads, isFetching, fetchError, activeThreadId, setThreads, setActiveThreadId, setLoading, setError]);

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const handleThreadCreated = async (thread: ThreadDTO) => {
    // Refresh the threads list from the server
    await refetch();

    // Set the newly created thread as active
    setActiveThreadId(thread.id);

    toast.success("Wątek utworzony", {
      description: `Wątek "${thread.name}" został pomyślnie utworzony.`,
    });
  };

  const handleThreadUpdated = async (thread: ThreadDTO) => {
    // Refresh the threads list from the server
    await refetch();

    toast.success("Wątek zaktualizowany", {
      description: `Nazwa wątku została zmieniona na "${thread.name}".`,
    });
  };

  const handleThreadDeleted = async (threadId: string) => {
    // If deleted thread was active, clear active thread
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }

    // Refresh the threads list from the server
    await refetch();

    toast.success("Wątek usunięty", {
      description: "Wątek i wszystkie powiązane dane zostały usunięte.",
    });
  };

  const handleTranscriptChange = (value: string) => {
    updateTranscriptDraft(value);
  };

  const handleGenerate = () => {
    // Placeholder for future AP generation
    toast.info("Funkcja w przygotowaniu", {
      description: "Generowanie Action Points będzie dostępne wkrótce.",
    });
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie wątków...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Wystąpił błąd</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Odśwież stronę
          </button>
        </div>
      </main>
    );
  }

  const isGenerateDisabled =
    transcriptDraft.isDirty ||
    transcriptDraft.content.length === 0 ||
    transcriptDraft.content.length > 30000;

  return (
    <main className="flex flex-col h-screen" role="main">
      <ThreadTabs
        threads={threads}
        activeThreadId={activeThreadId}
        onSelect={handleThreadSelect}
        onThreadCreated={handleThreadCreated}
        onThreadUpdated={handleThreadUpdated}
        onThreadDeleted={handleThreadDeleted}
      />

      {threads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="text-center text-muted-foreground max-w-md">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Brak wątków</h2>
            <p className="text-base mb-4">Utwórz swój pierwszy wątek, aby rozpocząć zarządzanie transkrypcjami i action points.</p>
            <p className="text-sm">Kliknij przycisk <span className="font-semibold">+</span> powyżej, aby utworzyć nowy wątek.</p>
          </div>
        </div>
      ) : activeThreadId ? (
        <>
          <div className="flex-1 overflow-hidden p-4 md:p-6">
            <div className="h-full max-w-7xl mx-auto">
              <TextareaTranscript
                value={transcriptDraft.content}
                onChange={handleTranscriptChange}
                maxLength={30000}
              />
            </div>
          </div>

          <ControlsBar
            disabled={isGenerateDisabled}
            onGenerate={handleGenerate}
            transcriptLength={transcriptDraft.content.length}
            isDirty={transcriptDraft.isDirty}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="text-center text-muted-foreground max-w-md">
            <div className="text-6xl mb-4">👆</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Wybierz wątek</h2>
            <p className="text-base">Wybierz jeden z wątków z zakładek powyżej, aby rozpocząć pracę z transkrypcją.</p>
          </div>
        </div>
      )}

      <SpinnerOverlay visible={false} label="Przetwarzanie..." />
    </main>
  );
}

/**
 * Main Dashboard Threads Page component.
 * Provides context and renders the dashboard content.
 */
export default function DashboardThreadsPage() {
  return (
    <ThreadsProvider>
      <DashboardThreadsContent />
    </ThreadsProvider>
  );
}
