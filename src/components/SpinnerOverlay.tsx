import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { semanticColors } from "@/lib/palette";

interface SpinnerOverlayProps {
  visible: boolean;
  label?: string;
}

/**
 * SpinnerOverlay component - Full-screen loading overlay with spinner.
 * Rendered in a portal to overlay the entire application.
 */
export default function SpinnerOverlay({ visible, label = "Ładowanie..." }: SpinnerOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!visible || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: "rgba(34, 56, 67, 0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="flex flex-col items-center gap-5 p-8 rounded-2xl shadow-2xl"
        style={{ backgroundColor: semanticColors.backgroundElevated }}
      >
        <div
          className="animate-spin rounded-full h-20 w-20"
          style={{
            border: `4px solid ${semanticColors.borderSubtle}`,
            borderTopColor: semanticColors.primary,
          }}
        ></div>
        <p className="text-lg font-bold" style={{ color: semanticColors.textPrimary }}>
          {label}
        </p>
      </div>
    </div>,
    document.body
  );
}
