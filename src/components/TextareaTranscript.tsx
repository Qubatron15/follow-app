import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
        <Label htmlFor={textareaId} className="text-base font-semibold">
          Transkrypcja spotkania
        </Label>
        <span
          id={counterId}
          className={`text-xs font-medium ${
            isOverLimit
              ? "text-destructive"
              : isNearLimit
              ? "text-orange-500"
              : "text-muted-foreground"
          }`}
          aria-live="polite"
        >
          {currentLength.toLocaleString("pl-PL")} / {maxLength.toLocaleString("pl-PL")} znaków
          {isOverLimit && (
            <span className="ml-2">
              (przekroczono o {Math.abs(remainingChars).toLocaleString("pl-PL")})
            </span>
          )}
        </span>
      </div>

      <Textarea
        id={textareaId}
        value={value}
        onChange={handleChange}
        placeholder="Wklej tutaj transkrypcję spotkania (do 30 000 znaków)...&#10;&#10;Możesz wkleić tekst z narzędzi do transkrypcji lub wpisać notatki ręcznie."
        className="flex-1 min-h-[300px] md:min-h-[400px] resize-none font-mono text-sm leading-relaxed"
        disabled={disabled}
        aria-describedby={counterId}
        aria-invalid={isOverLimit}
      />

      {isOverLimit && (
        <p className="text-sm text-destructive font-medium" role="alert">
          ⚠️ Transkrypcja przekracza maksymalną długość. Usuń {Math.abs(remainingChars).toLocaleString("pl-PL")} znaków.
        </p>
      )}
    </div>
  );
}
