import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateThread: () => void;
}

/**
 * EmptyState component - Displays when user has no threads.
 * Shows a welcoming message and CTA to create first thread.
 */
export default function EmptyState({ onCreateThread }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-4">
        {/* Logo placeholder - can be replaced with actual logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        </div>

        {/* Welcome heading */}
        <h1 className="text-2xl font-bold mb-3">Witaj w FollowApp!</h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8" id="empty-state-description">
          Tworzenie wątków pomoże Ci organizować rozmowy i śledzić ważne punkty akcji. Zacznij od utworzenia swojego
          pierwszego wątku.
        </p>

        {/* CTA Button */}
        <Button onClick={onCreateThread} size="lg" aria-describedby="empty-state-description">
          Nowy wątek
        </Button>
      </div>
    </div>
  );
}
