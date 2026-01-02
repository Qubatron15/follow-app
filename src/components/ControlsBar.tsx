import { Button } from "@/components/ui/button";

interface ControlsBarProps {
  disabled: boolean;
  onGenerate: () => void;
  transcriptLength: number;
  isDirty: boolean;
}

/**
 * ControlsBar component - Control panel with generate button and status info.
 * Displays transcript status and action buttons.
 */
export default function ControlsBar({
  disabled,
  onGenerate,
  transcriptLength,
  isDirty,
}: ControlsBarProps) {
  return (
    <div className="border-t bg-muted/30 px-4 md:px-6 py-4 sticky bottom-0 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Status:</span>{" "}
            {isDirty ? (
              <span className="text-orange-500 font-medium">Niezapisane zmiany</span>
            ) : transcriptLength > 0 ? (
              <span className="text-green-600 font-medium">Zapisano</span>
            ) : (
              <span>Brak transkrypcji</span>
            )}
          </div>

          {transcriptLength > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Długość:</span>{" "}
              {transcriptLength.toLocaleString("pl-PL")} znaków
            </div>
          )}
        </div>

        <Button
          onClick={onGenerate}
          disabled={disabled}
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          Generuj Action Points
        </Button>
      </div>
    </div>
  );
}
