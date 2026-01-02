import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface SpinnerOverlayProps {
  visible: boolean;
  label?: string;
}

/**
 * SpinnerOverlay component - Full-screen loading overlay with spinner.
 * Rendered in a portal to overlay the entire application.
 */
export default function SpinnerOverlay({
  visible,
  label = "Ładowanie...",
}: SpinnerOverlayProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        <p className="text-lg font-medium text-foreground">{label}</p>
      </div>
    </div>,
    document.body
  );
}
