import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CreateThreadModal from "@/components/CreateThreadModal";
import type { ThreadDTO } from "@/types";

interface ThreadTabsProps {
  threads: ThreadDTO[];
  activeThreadId: string | null;
  onSelect: (threadId: string) => void;
  onThreadCreated: (thread: ThreadDTO) => void;
}

/**
 * ThreadTabs component - Displays thread tabs with create new thread button.
 * Handles thread selection and creation.
 */
export default function ThreadTabs({
  threads,
  activeThreadId,
  onSelect,
  onThreadCreated,
}: ThreadTabsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleThreadCreated = (thread: ThreadDTO) => {
    onThreadCreated(thread);
    handleCloseModal();
  };

  return (
    <div className="w-full border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2 px-4 md:px-6 max-w-7xl mx-auto">
        <Tabs
          value={activeThreadId || undefined}
          onValueChange={onSelect}
          className="flex-1 overflow-x-auto"
        >
          <TabsList className="h-14 bg-transparent border-b-0 justify-start w-full">
            {threads.map((thread) => (
              <TabsTrigger
                key={thread.id}
                value={thread.id}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-sm font-medium transition-colors hover:text-primary"
              >
                {thread.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenModal}
          aria-label="Utwórz nowy wątek"
          className="h-10 w-10 rounded-full hover:bg-primary/10 flex-shrink-0"
        >
          <span className="text-xl font-semibold">+</span>
        </Button>
      </div>

      <CreateThreadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );
}
