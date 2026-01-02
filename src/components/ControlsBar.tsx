import { semanticColors } from "@/lib/palette";

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
    <div
      className="px-6 md:px-8 py-5 sticky bottom-0 shadow-2xl"
      style={{
        backgroundColor: semanticColors.backgroundElevated,
        borderTop: `2px solid ${semanticColors.border}`,
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div
            className="text-sm px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: semanticColors.backgroundSubtle,
              color: semanticColors.textPrimary,
            }}
          >
            <span className="font-semibold">Status:</span>{" "}
            {isDirty ? (
              <span
                className="font-bold"
                style={{ color: "#f59e0b" }}
              >
                Niezapisane zmiany
              </span>
            ) : transcriptLength > 0 ? (
              <span
                className="font-bold"
                style={{ color: semanticColors.success }}
              >
                Zapisano
              </span>
            ) : (
              <span style={{ color: semanticColors.textMuted }}>Brak transkrypcji</span>
            )}
          </div>

          {transcriptLength > 0 && (
            <div
              className="text-sm px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: semanticColors.backgroundSubtle,
                color: semanticColors.textPrimary,
              }}
            >
              <span className="font-semibold">Długość:</span>{" "}
              <span className="font-bold">{transcriptLength.toLocaleString("pl-PL")}</span> znaków
            </div>
          )}
        </div>

        <button
          onClick={onGenerate}
          disabled={disabled}
          className="w-full sm:w-auto sm:min-w-[240px] px-6 py-3.5 rounded-lg font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: disabled ? semanticColors.border : semanticColors.primary,
            color: semanticColors.textOnPrimary,
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = semanticColors.primaryHover;
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = semanticColors.primary;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          Generuj Action Points
        </button>
      </div>
    </div>
  );
}
