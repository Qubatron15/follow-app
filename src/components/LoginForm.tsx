import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { semanticColors } from "@/lib/palette";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof LoginFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Call login API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        toast.error("Błąd logowania", {
          description: data.error?.message || "Nie udało się zalogować. Spróbuj ponownie.",
        });
        return;
      }

      // Success - show toast and redirect
      toast.success("Zalogowano pomyślnie", {
        description: `Witaj, ${data.user.email}!`,
      });

      // Redirect to the intended page or /threads
      const targetUrl = redirectTo && redirectTo !== "/" ? redirectTo : "/threads";
      window.location.href = targetUrl;
    } catch {
      toast.error("Błąd logowania", {
        description: "Nie udało się połączyć z serwerem. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: semanticColors.textPrimary }}>
          Logowanie
        </h1>
        <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
          Zaloguj się do swojego konta
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Hasło</Label>
            <a href="/reset" className="text-xs hover:underline" style={{ color: semanticColors.primary }}>
              Zapomniałeś hasła?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            aria-invalid={!!errors.password}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: semanticColors.error }}>
              {errors.password}
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
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>

      {/* Register link */}
      <div className="text-center">
        <p className="text-sm" style={{ color: semanticColors.textSecondary }}>
          Nie masz konta?{" "}
          <a href="/register" className="font-medium hover:underline" style={{ color: semanticColors.primary }}>
            Zarejestruj się
          </a>
        </p>
      </div>
    </div>
  );
}
