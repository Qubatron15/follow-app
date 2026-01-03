import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ThreadsProvider, useThreadsContext } from "@/components/hooks/useThreadsContext";
import { useThreads } from "@/components/hooks/useThreads";
import { useTranscripts } from "@/components/hooks/useTranscripts";
import { useSaveTranscript } from "@/components/hooks/useSaveTranscript";
import { useActionPoints } from "@/components/hooks/useActionPoints";
import ThreadTabs from "@/components/ThreadTabs";
import TextareaTranscript from "@/components/TextareaTranscript";
import ControlsBar from "@/components/ControlsBar";
import SpinnerOverlay from "@/components/SpinnerOverlay";
import ActionPointsList from "@/components/ActionPointsList";
import AddActionPointModal from "@/components/AddActionPointModal";
import { semanticColors } from "@/lib/palette";
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
    markTranscriptClean,
    setLoading,
    setError,
  } = useThreadsContext();

  const { data: fetchedThreads, isLoading: isFetching, error: fetchError, refetch } = useThreads();
  const { transcripts, refetch: refetchTranscripts } = useTranscripts(activeThreadId);
  const { saveTranscript, isSaving } = useSaveTranscript();
  const { actionPoints, refetch: refetchActionPoints } = useActionPoints(activeThreadId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  // Load transcript when active thread changes or transcripts are fetched
  useEffect(() => {
    if (transcripts.length > 0 && activeThreadId) {
      // Load the most recent transcript (first in array, sorted by created_at desc)
      const latestTranscript = transcripts[0];
      updateTranscriptDraft(latestTranscript.content, latestTranscript.id, false);
    } else if (activeThreadId) {
      // No transcripts for this thread, clear the draft
      updateTranscriptDraft("", null, false);
    }
  }, [transcripts, activeThreadId, updateTranscriptDraft]);

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
    // Keep the existing transcriptId when updating content and mark as dirty
    updateTranscriptDraft(value, transcriptDraft.transcriptId, true);
  };

  const handleGenerate = async () => {
    if (!activeThreadId) {
      toast.error("Błąd", {
        description: "Nie wybrano wątku.",
      });
      return;
    }

    if (transcriptDraft.content.trim().length === 0) {
      toast.error("Błąd", {
        description: "Transkrypcja nie może być pusta.",
      });
      return;
    }

    // Save transcript (create or update)
    const savedTranscript = await saveTranscript(
      activeThreadId,
      transcriptDraft.content,
      transcriptDraft.transcriptId || undefined
    );

    if (savedTranscript) {
      // Update the draft with the saved transcript ID and mark as clean
      updateTranscriptDraft(savedTranscript.content, savedTranscript.id);
      markTranscriptClean();

      // Refresh transcripts list
      await refetchTranscripts();

      // Refresh action points list (new APs created automatically by backend)
      await refetchActionPoints();

      toast.success("Transkrypcja zapisana", {
        description: "Transkrypcja została pomyślnie zapisana. Action Points zostały automatycznie utworzone.",
      });
    } else {
      toast.error("Błąd", {
        description: "Nie udało się zapisać transkrypcji.",
      });
    }
  };

  if (isLoading) {
    return (
      <main
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: semanticColors.background }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 mx-auto mb-6"
            style={{
              border: `3px solid ${semanticColors.borderSubtle}`,
              borderTopColor: semanticColors.primary,
            }}
          ></div>
          <p className="text-lg font-medium" style={{ color: semanticColors.textSecondary }}>
            Ładowanie wątków...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: semanticColors.background }}
      >
        <div
          className="text-center max-w-md p-8 rounded-2xl shadow-lg"
          style={{ backgroundColor: semanticColors.backgroundElevated }}
        >
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: semanticColors.textPrimary }}>
            Wystąpił błąd
          </h2>
          <p className="text-base mb-6 leading-relaxed" style={{ color: semanticColors.textSecondary }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: semanticColors.primary,
              color: semanticColors.textOnPrimary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = semanticColors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = semanticColors.primary;
            }}
          >
            Odśwież stronę
          </button>
        </div>
      </main>
    );
  }

  const isGenerateDisabled =
    !transcriptDraft.isDirty || transcriptDraft.content.length === 0 || transcriptDraft.content.length > 30000;

  return (
    <main className="flex flex-col h-screen" role="main" style={{ backgroundColor: semanticColors.background }}>
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
          <div
            className="text-center max-w-lg p-12 rounded-2xl shadow-sm"
            style={{ backgroundColor: semanticColors.backgroundElevated }}
          >
            <div className="text-7xl mb-6">📝</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: semanticColors.textPrimary }}>
              Brak wątków
            </h2>
            <p className="text-base mb-3 leading-relaxed" style={{ color: semanticColors.textSecondary }}>
              Utwórz swój pierwszy wątek, aby rozpocząć zarządzanie transkrypcjami i action points.
            </p>
            <p className="text-sm" style={{ color: semanticColors.textMuted }}>
              Kliknij przycisk <span className="font-semibold">+</span> powyżej, aby utworzyć nowy wątek.
            </p>
          </div>
        </div>
      ) : activeThreadId ? (
        <>
          {/* Split view: Transcript (left) and Action Points (right) */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6 md:p-8">
            {/* Left side: Transcript */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-3 pb-2" style={{ borderBottom: `2px solid ${semanticColors.primary}` }}>
                <h2 className="text-xl font-bold" style={{ color: semanticColors.textPrimary }}>
                  Transkrypcja
                </h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <TextareaTranscript
                  value={transcriptDraft.content}
                  onChange={handleTranscriptChange}
                  maxLength={30000}
                />
              </div>
            </div>

            {/* Right side: Action Points */}
            <div
              className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-lg"
              style={{
                backgroundColor: semanticColors.backgroundElevated,
                border: `1px solid ${semanticColors.borderSubtle}`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-5"
                style={{
                  borderBottom: `1px solid ${semanticColors.border}`,
                  backgroundColor: semanticColors.backgroundSubtle,
                }}
              >
                <h2 className="text-xl font-bold" style={{ color: semanticColors.textPrimary }}>
                  Action Points
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: semanticColors.primary,
                    color: semanticColors.textOnPrimary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = semanticColors.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = semanticColors.primary;
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Dodaj AP
                </button>
              </div>

              {/* Action Points List */}
              <div className="flex-1 overflow-y-auto p-5">
                <ActionPointsList actionPoints={actionPoints} onRefetch={refetchActionPoints} />
              </div>
            </div>
          </div>

          <ControlsBar
            disabled={isGenerateDisabled}
            onGenerate={handleGenerate}
            transcriptLength={transcriptDraft.content.length}
            isDirty={transcriptDraft.isDirty}
          />

          {/* Add Action Point Modal */}
          {activeThreadId && (
            <AddActionPointModal
              threadId={activeThreadId}
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSuccess={refetchActionPoints}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div
            className="text-center max-w-lg p-12 rounded-2xl shadow-sm"
            style={{ backgroundColor: semanticColors.backgroundElevated }}
          >
            <div className="text-7xl mb-6">👆</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: semanticColors.textPrimary }}>
              Wybierz wątek
            </h2>
            <p className="text-base leading-relaxed" style={{ color: semanticColors.textSecondary }}>
              Wybierz jeden z wątków z zakładek powyżej, aby rozpocząć pracę z transkrypcją.
            </p>
          </div>
        </div>
      )}

      <SpinnerOverlay visible={isSaving} label="Zapisywanie transkrypcji..." />
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
