# Plan testów dla projektu **follow-app**

## 1. Wprowadzenie i cele testowania
Celem testów jest potwierdzenie, że aplikacja `follow-app` działa zgodnie z wymaganiami biznesowymi, jest bezpieczna, wydajna, a interfejs użytkownika – intuicyjny i dostępny. Testy mają:
- wykryć defekty na wczesnym etapie,
- zagwarantować integralność danych w Supabase,
- zweryfikować BOLA (Broken Object Level Authorization),
- zapewnić wysoką jakość kodu poprzez automatyzację w CI.

## 2. Zakres testów
Objęte testami będą:
1. Backend (API w `/src/pages/api/**` oraz warstwa usług w `/src/lib/services/**`).
2. Walidacje Zod w `/src/lib/schemas/**`.
3. Middleware `src/middleware/index.ts`.
4. Warstwa UI (Astro + React) – szczególnie:
   - Autoryzacja (formularze Auth),
   - DashboardThreadsPage (w tym Action Points UI),
   - Transcripts i Threads.
5. Integracja z Supabase (baza, auth).
6. Konfiguracja CI/CD (GitHub Actions).

Nie testujemy: zewnętrznego API OpenAI (stubowane), dokumentacji, plików markdown.

## 3. Typy testów
| Typ testu | Cel | Narzędzie |
|-----------|-----|-----------|
| Testy jednostkowe | Walidacje Zod, logika usług, utilsy | Jest |
| Testy integracyjne | Endpointy API + Supabase (test DB) | Jest + Supertest |
| Testy komponentów | Zachowanie React / Astro components | Jest + Testing Library |
| Testy E2E | Pełne scenariusze użytkownika (UI+API) | Playwright |
| Testy wydajnościowe | Czas odpowiedzi API, obciążenie 30 000 znaków | k6 |
| Testy bezpieczeństwa | BOLA, RLS, XSS, CSRF | Zap OWASP (dynamic), eslint-plugin-security |
| Testy dostępności | WCAG 2.1 AA | axe-core w Playwright |
| Testy regresji wizualnej | Kluczowe ekrany | Playwright + @playwright/test-snapshots |

## 4. Scenariusze testowe kluczowych funkcjonalności
### 4.1 Autoryzacja
1. Rejestracja nowego użytkownika (pozytywny).
2. Logowanie z poprawnymi / błędnymi danymi.
3. Dostęp do chronionego endpointu bez tokena → 401.

### 4.2 Threads
1. Utworzenie wątku → 201 + wpis w DB.
2. Pobranie listy własnych wątków.
3. Próba odczytu cudzego wątku → 404/403 (BOLA).

### 4.3 Transcripts
1. Dodanie transkryptu o długości 30 000 znaków.

### 4.4 Action Points
1. Dodanie AP (tytuł 255 znaków).
2. Edycja tytułu in-line, anulowanie.
3. Zmiana statusu isCompleted.
4. BOLA – edycja/usuń AP nienależącego do użytkownika.

### 4.5 UI/UX
1. Renderowanie DashboardThreadsPage na desktop & mobile.
2. Obsługa błędów API – toast z komunikatem PL.
3. Walidacje formularzy w czasie rzeczywistym (Zod).

### 4.6 Middleware
1. Supabase client dostępny w `context.locals`.
2. Brak przecieku danych w kontekście innego req.

### 4.7 CI/CD
1. Pipeline uruchamia pełen zestaw testów i blokuje merge przy niepowodzeniu.

## 5. Środowisko testowe
- Node 20 LTS.
- Supabase lokalnie (docker) z testową bazą danych.
- Zmienna `SUPABASE_URL` kierująca na staging DB.
- Headless Chrome/Firefox (Playwright).
- Oddzielny zasób Storage Supabase do testów, czyszczony po teście.
- GH Actions runner Ubuntu-latest.

## 6. Narzędzia do testowania
- Jest + ts-jest → testy unit/integration.
- Supertest → zapytania HTTP.
- @testing-library/react + @testing-library/astro.
- Playwright (+axe-core) → E2E + dostępność + snapshot.
- k6 → performance.
- eslint, prettier, eslint-plugin-security → statyczna analiza.
- GitHub Actions → automatyzacja.
- Docker Compose → Supabase test stack.

## 7. Harmonogram testów
| Faza | Zakres | Tyg. |
|------|--------|------|
| Analiza wymagań | Przygotowanie specyfikacji testów | 1 |
| Implementacja testów jednostkowych i walidacji | Schemas, services | 2–3 |
| Integracja + API | Endpointy z Supabase | 4 |
| Testy komponentów React/Astro | Formularze, dashboard | 4–5 |
| E2E + bezpieczeństwo | Pełne scenariusze, BOLA, a11y | 6 |
| Wydajność & stabilność | k6 + regresja | 7 |
| Testy regresji przy releasach | Ciągłe | ciągle |

## 8. Kryteria akceptacji testów
- Pokrycie kodu (branches) ≥ 85 % dla `src/lib/**`.
- Wszystkie testy `unit`, `integration`, `component`, `e2e` zielone.
- Czas odpowiedzi API < 300 ms (p95) dla 50 RPS.
- 0 krytycznych i wysokich defektów w OWASP ZAP.
- Brak naruszeń WCAG 2.1 AA na głównych ekranach.
- Pipeline CI musi zakończyć się sukcesem.

## 9. Role i odpowiedzialności
| Rola | Odpowiedzialności |
|------|-------------------|
| QA Inżynier (Ty) | Tworzenie & utrzymanie testów, raportowanie błędów |
| Dev Frontend | Naprawa defektów UI, wsparcie testów komponentów |
| Dev Backend | Naprawa defektów API, optymalizacja wydajności |
| DevOps | Utrzymanie środowisk testowych, CI/CD |
| Product Owner | Akceptacja kryteriów i priorytetyzacja defektów |

## 10. Procedury raportowania błędów
1. Defekt zgłaszany w GitHub Issues z etykietą `bug`.
2. Obowiązkowe pola: kroki reprodukcji, oczekiwany vs. aktualny rezultat, zrzuty ekranów/logi, środowisko.
3. Priorytety: Blocker, High, Medium, Low.
4. QA weryfikuje naprawę w branchu i zamyka issue po przejściu testu regresji.
5. Cotygodniowe spotkanie QA-Dev – przegląd otwartych defektów.

---

Plan testów został przygotowany z uwzględnieniem stosu Astro 5 + React 19 + Supabase, struktury repozytorium oraz kluczowych wymagań funkcjonalnych i niefunkcjonalnych projektu `follow-app`.
