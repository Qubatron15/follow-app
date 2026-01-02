import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { semanticColors } from "@/lib/palette";

interface TextareaTranscriptProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

/**
 * TextareaTranscript component - Large textarea for meeting transcripts.
 * Includes character counter that changes color when approaching limit.
 */
export default function TextareaTranscript({
  value,
  onChange,
  maxLength = 30000,
  disabled = false,
}: TextareaTranscriptProps) {
  const textareaId = useId();
  const counterId = useId();

  const currentLength = value.length;
  const remainingChars = maxLength - currentLength;
  const percentUsed = (currentLength / maxLength) * 100;
  
  // Change color when over 95% of limit
  const isNearLimit = percentUsed >= 95;
  const isOverLimit = currentLength > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span
          id={counterId}
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: isOverLimit
              ? "#fee2e2"
              : isNearLimit
              ? "#fef3c7"
              : semanticColors.backgroundSubtle,
            color: isOverLimit
              ? semanticColors.error
              : isNearLimit
              ? "#d97706"
              : semanticColors.textSecondary,
          }}
          aria-live="polite"
        >
          {currentLength.toLocaleString("pl-PL")} / {maxLength.toLocaleString("pl-PL")} znaków
          {isOverLimit && (
            <span className="ml-2 font-bold">
              (przekroczono o {Math.abs(remainingChars).toLocaleString("pl-PL")})
            </span>
          )}
        </span>
      </div>

      <div
        className="flex-1 rounded-xl overflow-hidden shadow-sm"
        style={{
          border: `2px solid ${isOverLimit ? semanticColors.error : semanticColors.border}`,
          backgroundColor: semanticColors.backgroundElevated,
        }}
      >
        <Textarea
          id={textareaId}
          value={value}
          onChange={handleChange}
          placeholder="Wklej tutaj transkrypcję spotkania (do 30 000 znaków)...&#10;&#10;Możesz wkleić tekst z narzędzi do transkrypcji lub wpisać notatki ręcznie."
          className="h-full min-h-[300px] md:min-h-[400px] resize-none text-sm leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
          style={{
            backgroundColor: "transparent",
            color: semanticColors.textPrimary,
          }}
          disabled={disabled}
          aria-describedby={counterId}
          aria-invalid={isOverLimit}
        />
      </div>

      {isOverLimit && (
        <div
          className="text-sm font-medium px-4 py-3 rounded-lg flex items-center gap-2"
          role="alert"
          style={{
            backgroundColor: "#fee2e2",
            color: semanticColors.error,
          }}
        >
          <span className="text-lg">⚠️</span>
          <span>
            Transkrypcja przekracza maksymalną długość. Usuń{" "}
            {Math.abs(remainingChars).toLocaleString("pl-PL")} znaków.
          </span>
        </div>
      )}
    </div>
  );
}
