import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth.schema";
import { semanticColors } from "@/lib/palette";

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof RegisterFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual registration logic with Supabase
      // For now, just show a placeholder message
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Registration attempt:", {
        email: formData.email,
        password: "[REDACTED]",
      });

      setIsSuccess(true);
      toast.success("Rejestracja pomyślna", {
        description: "Sprawdź swoją skrzynkę e-mail, aby aktywować konto.",
      });
    } catch (error) {
      toast.error("Błąd rejestracji", {
        description: "Nie udało się utworzyć konta. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterFormData) => (
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
        <div className="text-6xl mb-4">✉️</div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: semanticColors.textPrimary }}
        >
          Sprawdź swoją skrzynkę
        </h1>
        <p className="text-base leading-relaxed" style={{ color: semanticColors.textSecondary }}>
          Wysłaliśmy link aktywacyjny na adres <strong>{formData.email}</strong>. Kliknij w link,
          aby aktywować swoje konto.
        </p>
        <div className="pt-4">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: semanticColors.textPrimary }}
        >
          Rejestracja
        </h1>
        <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
          Utwórz nowe konto
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.pl"
            value={formData.email}
            onChange={handleChange("email")}
            aria-invalid={!!errors.email}
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs mt-1" style={{ color: semanticColors.error }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
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
          <Label htmlFor="confirmPassword">Powtórz hasło</Label>
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
          {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
        </Button>
      </form>

      {/* Login link */}
      <div className="text-center">
        <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
          Masz już konto?{" "}
          <a
            href="/login"
            className="font-medium hover:underline"
            style={{ color: semanticColors.primary }}
          >
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
