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
    <div className="w-full border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2 px-4 md:px-6 max-w-7xl mx-auto">
        <Tabs
          value={activeThreadId || undefined}
          onValueChange={onSelect}
          className="flex-1 overflow-x-auto"
        >
          <TabsList className="h-14 bg-transparent border-b-0 justify-start w-full">
            {threads.map((thread) => (
              <div key={thread.id} className="relative group">
                <TabsTrigger
                  value={thread.id}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-sm font-medium transition-colors hover:text-primary pr-10"
                >
                  {thread.name}
                </TabsTrigger>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Opcje dla wątku ${thread.name}`}
                    >
                      <span className="text-sm">⋮</span>
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

        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenCreateModal}
          aria-label="Utwórz nowy wątek"
          className="h-10 w-10 rounded-full hover:bg-primary/10 flex-shrink-0"
        >
          <span className="text-xl font-semibold">+</span>
        </Button>
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
