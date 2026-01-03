# Specyfikacja techniczna modułu uwierzytelniania (US-010)

Autor: Cascade AI – 03-01-2026

---

## Spis treści
1. Wprowadzenie
2. Architektura interfejsu użytkownika
3. Logika backendowa
4. System uwierzytelniania (Supabase Auth)
5. Scenariusze przepływu i obsługa błędów
6. Załączniki – kontrakty typów i helpery

---

## 1. Wprowadzenie
Niniejszy dokument definiuje kompletną architekturę modułu rejestracji, logowania, wylogowywania oraz odzyskiwania hasła użytkownika zgodną z wymaganiami **US-010** w _PRD_ oraz technologiami wskazanymi w _tech-stack.md_. Projekt musi:

* nie naruszać już zaimplementowanych funkcjonalności (wątki, transkrypcje, action-pointy),
* wykorzystywać Supabase Auth jako jedyne źródło prawdy o kontach,
* zachować istniejące standardy kodu (TypeScript 5, Astro 5, React 19, Tailwind 4, Shadcn/ui, Zod, Supabase-first BFF). 

---

## 2. Architektura interfejsu użytkownika
### 2.1 Podział widoków
| Strona / widok | Typ pliku | Dostępność | Opis |
| -------------- | --------- | ---------- | ---- |
| `/login`       | `login.astro` | public     | Ekran logowania i link do rejestracji „Nie masz konta?”. |
| `/register`    | `register.astro` | public | Formularz rejestracji. |
| `/reset`       | `reset-request.astro` | public | Formularz „Zapomniałeś hasła?”. |
| `/reset/[token]` | `reset-confirm.astro` | public | Formularz ustawienia nowego hasła (hash w URL). |
| `/*` (dashboard) | istniejące strony Astro / React | **auth-only** | Wszystkie dotychczasowe widoki wewnętrzne. |

> **Routing** – kierowanie odbywa się przez Astro router (`output: "server"`). W middleware sprawdzamy `context.locals.session`, w razie braku – redirect do `/login?redirect=<path>`.

### 2.2 Layouty
* **`src/layouts/AuthLayout.astro`** – prosty, scentralizowany kontener formularzy (max-width, card). Brak bocznych paneli.
* **`src/layouts/Layout.astro` (istniejący)** – rozszerzony o komponent `UserMenu` z przyciskiem „Wyloguj” (po prawej w navbarze).
* Ładowanie layoutu zależne od zalogowania:
  * public pages → `AuthLayout`
  * protected pages → `Layout`

### 2.3 Komponenty React (shadcn/ui)
| Komponent | Lokalizacja | Odpowiedzialność |
| --------- | ----------- | ---------------- |
| `AuthForm` | `src/components/AuthForm.tsx` | Abstrakcyjny formularz (kontroluje pola, walidację, loading, error). Przekazuje callback `onSubmit(values)`. |
| `LoginForm` | `src/components/LoginForm.tsx` | Dziedziczy `AuthForm`; pola: e-mail, hasło; akcje: „Zaloguj”, linki do rejestracji i resetu. |
| `RegisterForm` | `src/components/RegisterForm.tsx` | Pola: e-mail, hasło, hasło-powtórz; wymusi silne hasło. |
| `ResetRequestForm` | `src/components/ResetRequestForm.tsx` | Pole: e-mail; wysyła link resetu. |
| `ResetConfirmForm` | `src/components/ResetConfirmForm.tsx` | Pola: nowe hasło + powtórzenie. Token pobierany z props. |
| `UserMenu` | `src/components/UserMenu.tsx` | Dropdown w navbarze; pokazuje adres e-mail, przycisk „Wyloguj”. |

> Wszystkie formularze korzystają z hooków z punktu 2.4.

### 2.4 Hooki React
| Hook | Lokalizacja | Zależności | Opis |
| ---- | ----------- | ---------- | ---- |
| `useAuth()` | `src/components/hooks/useAuth.ts` | Supabase JS | Zwraca `session, user, isLoading, signIn, signUp, signOut, resetPassword, updatePassword`. Abstrahuje wywołania Supabase. |
| `useProtectedRoute()` | `src/components/hooks/useProtectedRoute.ts` | next/router-like | W `useEffect` sprawdza `session`; w razie braku – `window.location = "/login?redirect=…"`. |

### 2.5 Walidacja i komunikaty
* Zod schemas w `src/lib/schemas/auth.schema.ts`:
  * `emailSchema` – RFC 5322, max 255 znaków,
  * `passwordSchema` – min 8 znaków, 1 duża litera, 1 cyfra, 1 znak specjalny,
  * Kompozyty: `loginSchema`, `registerSchema`, `resetRequestSchema`, `resetConfirmSchema`.
* Komponent `FormError` renderuje komunikat pod polem zgodny z design system (czerwony 300, text-xs).

### 2.6 Scenariusze UX (happy-path)
1. **Login** – użytkownik podaje dane → `supabase.auth.signInWithPassword` → redirect do ścieżki `redirect` lub `/`.
2. **Register** – wypełnia formularz → Supabase wysyła link aktywacyjny (auth config: magic link off, email confirm on). Komunikat „Sprawdź skrzynkę e-mail”.
3. **Password reset** – wniosek resetu → Supabase mail; formularz confirm ustawia nowe hasło.
4. **Logout** – klik w UserMenu → `supabase.auth.signOut()` → przekierowanie do `/login`.
5. **Session timeout** – middleware wykrywa brak sesji → redirect.

---

## 3. Logika backendowa
### 3.1 Middleware (aktualizacja)
Plik: `src/middleware/index.ts` (już istnieje) – rozszerzyć:
```ts
if (!context.locals.session) {
  const authSession = await context.locals.supabase.auth.getSession();
  context.locals.session = authSession.data.session ?? null;
}
```
* Jeśli żądanie dotyczy chronionej ścieżki (`/^\/api|\/src\/pages\/(?!login|register|reset)/`) **i** `!session` → redirect 302 do `/login`.

### 3.2 Endpointy API
Supabase dostarcza wbudowane REST/GoTrue endpointy (`/auth/v1/*`). Nie klonujemy ich, ale tworzymy cienką warstwę do walidacji i custom messaging:
| Endpoint | Plik | Metoda | Opis |
| -------- | ---- | ------ | ---- |
| `/api/auth/login` | `src/pages/api/auth/login.ts` | POST | Przyjmuje `{ email, password }`, waliduje zod, wywołuje `supabase.auth.signInWithPassword`. |
| `/api/auth/register` | `…/register.ts` | POST | `{ email, password }` → `signUp({ email, password, options:{emailRedirectTo:ENV.RESET_REDIRECT}})` |
| `/api/auth/reset` | `…/reset-request.ts` | POST | `{ email }` → `resetPasswordForEmail`. |
| `/api/auth/reset/[token]` | `…/reset-confirm.ts` | POST | `{ password }` + URL token → `supabase.auth.updateUser` |

> Frontend **może** wołać SDK bezpośrednio z przeglądarki; endpointy służą SSR (Astro actions) i spójnej obsłudze błędów HTTP.

### 3.3 Modele danych
* Konta użytkowników przechowuje Supabase (`auth.users`).
* Nasza baza (wątki, AP itd.) już zawiera `user_id` typu UUID – powiązanie bez zmian.

### 3.4 Walidacja i obsługa błędów
* Zod schemas z pkt 2.5 na wejściu do endpointów.
* Błędy Supabase mapujemy:
  * 400 → Nieprawidłowe dane (np. słabe hasło),
  * 401 → Złe dane logowania,
  * 409 → Użytkownik już istnieje,
  * 500 → Inne.
* Globalny helper `mapAuthErrorToResponse` w `src/lib/errors/auth-errors.ts`.

### 3.5 SSR a stan sesji
* Wszystkie strony Astro mają w `getStaticPaths`/`get` dostęp do `context.locals.session`.
* Przykład w dashboard page:
```ts
export async function get({ locals, redirect }) {
  if (!locals.session) return redirect('/login');
  // fetch threads by locals.session.user.id
}
```

---

## 4. System uwierzytelniania (Supabase Auth)
### 4.1 Konfiguracja Supabase
* **Provider**: E-mail + Hasło.
* **Email confirmations**: ON (link aktywacyjny).
* **Password recovery**: ON.
* **Redirect URLs**: 
  * signup → `${APP_URL}/login?confirmed=1`,
  * reset → `${APP_URL}/reset/{token}`.
* **RLS**: tabela domenowa `public` – brak zmian.

### 4.2 Integracja z aplikacją
1. `supabase.client.ts` już eksportuje typowany klient; dodaj:
```ts
export const authClient = supabase.auth;
```
2. W hooks `useAuth` korzystamy z `createBrowserClient` by Supabase JS.
3. W SSR (middleware) używamy `supabase.auth.getSession()`.
4. _RememberMe_ przechowywane w Cookie (domyślnie).

---

## 5. Scenariusze przepływu i obsługa błędów
### 5.1 Diagram sekwencji – logowanie (skrót)
```
User → LoginForm → /api/auth/login → Supabase Auth → OK
                         ↑                           ↓
                        401 ←  error mapping  ←──────┘
```

### 5.2 Tabelaryczne zestawienie błędów
| Kod Supabase | Nasz kod | HTTP | Komunikat dla UI |
| ------------ | -------- | ---- | ---------------- |
| `INVALID_LOGIN` | `AUTH_INVALID` | 401 | „Niepoprawny e-mail lub hasło.” |
| `USER_ALREADY_REGISTERED` | `AUTH_DUPLICATE` | 409 | „Konto z tym adresem już istnieje.” |
| `WEAK_PASSWORD` | `AUTH_WEAK_PW` | 400 | „Hasło nie spełnia kryteriów bezpieczeństwa.” |
| inne | `AUTH_UNKNOWN` | 500 | „Wystąpił nieoczekiwany błąd. Spróbuj ponownie.” |

### 5.3 Testy e2e (Cypress)
* Scenariusze: login happy-path, błędne dane, rejestracja, reset hasła.

---

## 6. Załączniki – kontrakty i helpery
### 6.1 `src/types.ts` – rozszerzenie
```ts
declare module "@supabase/supabase-js" {
  interface Session {
    user: User & { email: string };
  }
}
```

### 6.2 Pomocnicze utilsy
* `redirectWithQuery(path, params)` – buduje URL z QueryString.
* `assertIsAuthenticated(session): asserts session is Session`.

---

## Podsumowanie
Specyfikacja definiuje kompletną architekturę modułu uwierzytelniania zgodnego z Supabase Auth, integrującą się z Astro 5 i React 19. Zawiera pełny opis UI, hooków, endpointów, middleware oraz mapowania błędów i stanów sesji, co pozwoli na implementację bez ryzyka regresji w istniejących funkcjach FollowApp.
