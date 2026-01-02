import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateThreadModal from "@/components/CreateThreadModal";
import EditThreadModal from "@/components/EditThreadModal";
import DeleteThreadDialog from "@/components/DeleteThreadDialog";
import { semanticColors } from "@/lib/palette";
import type { ThreadDTO } from "@/types";

interface ThreadTabsProps {
  threads: ThreadDTO[];
  activeThreadId: string | null;
  onSelect: (threadId: string) => void;
  onThreadCreated: (thread: ThreadDTO) => void;
  onThreadUpdated: (thread: ThreadDTO) => void;
  onThreadDeleted: (threadId: string) => void;
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
  onThreadUpdated,
  onThreadDeleted,
}: ThreadTabsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ThreadDTO | null>(null);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleThreadCreated = (thread: ThreadDTO) => {
    onThreadCreated(thread);
    handleCloseCreateModal();
  };

  const handleOpenEditModal = (thread: ThreadDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedThread(thread);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedThread(null);
  };

  const handleThreadUpdated = (thread: ThreadDTO) => {
    onThreadUpdated(thread);
    handleCloseEditModal();
  };

  const handleOpenDeleteDialog = (thread: ThreadDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedThread(thread);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedThread(null);
  };

  const handleThreadDeleted = (threadId: string) => {
    onThreadDeleted(threadId);
    handleCloseDeleteDialog();
  };

  return (
    <div
      className="w-full sticky top-0 z-10 shadow-md"
      style={{
        backgroundColor: semanticColors.backgroundElevated,
        borderBottom: `3px solid ${semanticColors.primary}`,
      }}
    >
      <div className="flex items-center gap-3 px-6 md:px-8 max-w-7xl mx-auto">
        <Tabs
          value={activeThreadId || undefined}
          onValueChange={onSelect}
          className="flex-1 overflow-x-auto"
        >
          <TabsList
            className="h-16 bg-transparent border-b-0 justify-start w-full gap-1"
            style={{ backgroundColor: "transparent" }}
          >
            {threads.map((thread) => (
              <div key={thread.id} className="relative group">
                <TabsTrigger
                  value={thread.id}
                  className="rounded-t-lg px-5 py-3 text-sm font-semibold transition-all duration-200 pr-11 data-[state=inactive]:hover:bg-opacity-50"
                  style={{
                    color:
                      activeThreadId === thread.id
                        ? semanticColors.primary
                        : semanticColors.textSecondary,
                    backgroundColor:
                      activeThreadId === thread.id
                        ? semanticColors.backgroundSubtle
                        : "transparent",
                    borderBottom:
                      activeThreadId === thread.id
                        ? `3px solid ${semanticColors.primary}`
                        : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (activeThreadId !== thread.id) {
                      e.currentTarget.style.backgroundColor = semanticColors.backgroundSubtle;
                      e.currentTarget.style.color = semanticColors.textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeThreadId !== thread.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = semanticColors.textSecondary;
                    }
                  }}
                >
                  {thread.name}
                </TabsTrigger>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Opcje dla wątku ${thread.name}`}
                      style={{
                        color: semanticColors.textSecondary,
                      }}
                    >
                      <span className="text-base font-bold">⋮</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleOpenEditModal(thread, e)}>
                      ✏️ Edytuj nazwę
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleOpenDeleteDialog(thread, e)}
                      className="text-destructive focus:text-destructive"
                    >
                      🗑️ Usuń wątek
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </TabsList>
        </Tabs>

        <button
          onClick={handleOpenCreateModal}
          aria-label="Utwórz nowy wątek"
          className="h-11 w-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl transition-all duration-200 shadow-md hover:shadow-lg"
          style={{
            backgroundColor: semanticColors.primary,
            color: semanticColors.textOnPrimary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = semanticColors.primaryHover;
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = semanticColors.primary;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          +
        </button>
      </div>

      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onThreadCreated={handleThreadCreated}
      />

      <EditThreadModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        thread={selectedThread}
        onThreadUpdated={handleThreadUpdated}
      />

      <DeleteThreadDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        thread={selectedThread}
        onThreadDeleted={handleThreadDeleted}
      />
    </div>
  );
}
