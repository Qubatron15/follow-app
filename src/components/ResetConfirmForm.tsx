import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetConfirmSchema, type ResetConfirmFormData } from "@/lib/schemas/auth.schema";
import { semanticColors } from "@/lib/palette";

interface ResetConfirmFormProps {
  token: string;
}

export default function ResetConfirmForm({ token }: ResetConfirmFormProps) {
  const [formData, setFormData] = useState<ResetConfirmFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetConfirmFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = resetConfirmSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetConfirmFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ResetConfirmFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual password reset confirmation logic with Supabase
      // For now, just show a placeholder message
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Password reset confirmation with token:", token);
      console.log("New password: [REDACTED]");

      setIsSuccess(true);
      toast.success("Hasło zmienione", {
        description: "Możesz teraz zalogować się przy użyciu nowego hasła.",
      });
    } catch (error) {
      toast.error("Błąd", {
        description: "Nie udało się zmienić hasła. Link mógł wygasnąć.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ResetConfirmFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: semanticColors.textPrimary }}
        >
          Hasło zostało zmienione
        </h1>
        <p className="text-base leading-relaxed" style={{ color: semanticColors.textSecondary }}>
          Twoje hasło zostało pomyślnie zmienione. Możesz teraz zalogować się przy użyciu nowego
          hasła.
        </p>
        <div className="pt-4">
          <Button
            asChild
            style={{
              backgroundColor: semanticColors.primary,
              color: semanticColors.textOnPrimary,
            }}
          >
            <a href="/login">Przejdź do logowania</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: semanticColors.textPrimary }}
        >
          Nowe hasło
        </h1>
        <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
          Ustaw nowe hasło dla swojego konta
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Nowe hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            aria-invalid={!!errors.password}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: semanticColors.error }}>
              {errors.password}
            </p>
          )}
          <p className="text-xs" style={{ color: semanticColors.textMuted }}>
            Min. 8 znaków, 1 wielka litera, 1 cyfra, 1 znak specjalny
          </p>
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Powtórz nowe hasło</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-xs mt-1" style={{ color: semanticColors.error }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          style={{
            backgroundColor: semanticColors.primary,
            color: semanticColors.textOnPrimary,
          }}
        >
          {isLoading ? "Zmiana hasła..." : "Zmień hasło"}
        </Button>
      </form>

      {/* Back to login link */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm font-medium hover:underline"
          style={{ color: semanticColors.primary }}
        >
          Wróć do logowania
        </a>
      </div>
    </div>
  );
}
