import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetRequestSchema, type ResetRequestFormData } from "@/lib/schemas/auth.schema";
import { semanticColors } from "@/lib/palette";

export default function ResetRequestForm() {
  const [formData, setFormData] = useState<ResetRequestFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetRequestFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = resetRequestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetRequestFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ResetRequestFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual password reset logic with Supabase
      // For now, just show a placeholder message

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Password reset request for:", formData.email);

      setIsSuccess(true);
      toast.success("Link wysłany", {
        description: "Sprawdź swoją skrzynkę e-mail.",
      });
    } catch (error) {
      toast.error("Błąd", {
        description: "Nie udało się wysłać linku resetującego. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ResetRequestFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: semanticColors.textPrimary }}>
          Sprawdź swoją skrzynkę
        </h1>
        <p className="text-base leading-relaxed" style={{ color: semanticColors.textSecondary }}>
          Jeśli konto z adresem <strong>{formData.email}</strong> istnieje, wysłaliśmy na nie link do resetowania hasła.
        </p>
        <p className="text-sm" style={{ color: semanticColors.textMuted }}>
          Link będzie ważny przez 24 godziny.
        </p>
        <div className="pt-4">
          <a href="/login" className="text-sm font-medium hover:underline" style={{ color: semanticColors.primary }}>
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
        <h1 className="text-3xl font-bold mb-2" style={{ color: semanticColors.textPrimary }}>
          Resetowanie hasła
        </h1>
        <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
          Podaj adres e-mail powiązany z Twoim kontem
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
          {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>
      </form>

      {/* Back to login link */}
      <div className="text-center">
        <a href="/login" className="text-sm font-medium hover:underline" style={{ color: semanticColors.primary }}>
          Wróć do logowania
        </a>
      </div>
    </div>
  );
}
