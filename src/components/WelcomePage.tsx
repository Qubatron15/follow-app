import { useEffect, useState } from "react";
import { useThreads } from "./hooks/useThreads";
import EmptyState from "./EmptyState";
import CreateThreadModal from "./CreateThreadModal";
import type { ThreadDTO } from "@/types";

/**
 * WelcomePage component - Main welcome screen for users without threads.
 * Handles thread fetching, conditional rendering, and redirection logic.
 */
export default function WelcomePage() {
  const { data: threads, isLoading, error, refetch } = useThreads();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect to first thread if user has threads
  useEffect(() => {
    if (!isLoading && threads.length > 0) {
      const firstThread = threads[0];
      window.location.href = `/threads/${firstThread.id}`;
    }
  }, [isLoading, threads]);

  const handleCreateThreadClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleThreadCreated = async (thread: ThreadDTO) => {
    setIsModalOpen(false);
    // Redirect to the newly created thread
    window.location.href = `/threads/${thread.id}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">Ładowanie...</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Ładowanie wątków...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-4 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Wystąpił błąd</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // Show empty state when no threads
  return (
    <>
      <EmptyState onCreateThread={handleCreateThreadClick} />
      <CreateThreadModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onThreadCreated={handleThreadCreated}
      />
    </>
  );
}
