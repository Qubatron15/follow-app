# API Endpoint Implementation Plan: POST /api/threads

## 1. Przegląd punktu końcowego
Tworzy nowy wątek ("thread") dla zalogowanego użytkownika.  Każdy użytkownik może posiadać maksymalnie 20 wątków, a nazwy wątków muszą być unikalne (case-sensitive) w obrębie tego użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** `POST`
- **URL:** `/api/threads`
- **Parametry ścieżki / query:** brak
- **Body (JSON):**
  ```json
  {
    "name": "Project Alpha"
  }
  ```
- **Parametry:**
  - **Wymagane:**
    - `name : string` – niepuste, ≤ 20 znaków, unikalne w obrębie użytkownika
  - **Opcjonalne:** brak

### Walidacja wejścia
Walidację realizujemy za pomocą `zod` w warstwie routingu:
```ts
const createThreadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ERR.THREAD_NAME_INVALID)
    .max(20, ERR.THREAD_NAME_INVALID),
});
```

## 3. Wykorzystywane typy
| Nazwa                                  | Plik / Lokalizacja                 | Użycie |
|----------------------------------------|-------------------------------------|--------|
| `CreateThreadCommand`                  | `src/types.ts`                     | DTO wejściowe (body) |
| `ThreadDTO`                            | `src/types.ts`                     | DTO odpowiedzi |
| `ErrorResponse`                        | `src/types.ts` (dodać jeśli brak)  | Standardowy JSON błędu |

## 4. Szczegóły odpowiedzi
| Kod | Opis                                             | Body |
|-----|--------------------------------------------------|------|
| 201 | Wątek utworzony pomyślnie                        | `{ "data": ThreadDTO }` |
| 400 | Niepoprawne dane wejściowe (`THREAD_NAME_INVALID`)| `{ "error": { code, message } }` |
| 409 | Duplikat nazwy (`THREAD_NAME_DUPLICATE`)          | j.w. |
| 429 | Limit 20 wątków przekroczony (`THREAD_LIMIT_REACHED`)| j.w. |
| 401 | Brak autentykacji                                 | j.w. |
| 500 | Nieoczekiwany błąd serwera                        | j.w. |

## 5. Przepływ danych
1. Klient wysyła `POST /api/threads` z body `CreateThreadCommand`.
2. Astro route `/src/pages/api/threads/post.ts`:
   1. Pobiera `supabase` oraz `user` z `context.locals`.
   2. Waliduje body przy użyciu `zod`.
   3. Używa `threadsService.createThread(user.id, body.name)`.
3. `threadsService.createThread` (`src/lib/services/threads.service.ts`):
   1. Sprawdza duplikat nazwy: `select ... eq('name', name).single()`.
   2. Liczy istniejące wątki (`select count(*)`). Jeśli ≥ 20 → `THREAD_LIMIT_REACHED`.
   3. Wykonuje `insert` do tabeli `threads`, przekazując `user_id`.
   4. Zwraca `ThreadDTO`.
4. Route zwraca `Response.json({ data: dto }, { status: 201 })`.

## 6. Względy bezpieczeństwa
- **Autentykacja:** wymagane zalogowanie; brak `user` → 401.
- **Autoryzacja:** użytkownik może tworzyć wyłącznie swoje wątki (używamy `user.id`).
- endpoint powinien byc zabezpieczony przy użyciu Supabase Auth.
- Payload oczyszczany (`trim`) w schema, zapobiega XSS.
- Zapobieganie SQL-Injection zapewnia Supabase query builder.
- Ograniczenie liczby requestów (ratelimit) możliwe w przyszłości poprzez middleware.

## 7. Obsługa błędów
| Scenariusz                                 | Status | Kod aplikacyjny           | Źródło |
|--------------------------------------------|--------|---------------------------|--------|
| `name` pusty lub > 20 znaków               | 400    | THREAD_NAME_INVALID       | zod    |
| Duplikat nazwy (kolizja unique index)      | 409    | THREAD_NAME_DUPLICATE     | service + DB error code `23505` |
| Limit 20 wątków przekroczony (trigger)     | 429    | THREAD_LIMIT_REACHED      | pre-check lub przechwycenie DB error `P0001` |
| Niezalogowany user                         | 401    | AUTH_REQUIRED             | middleware |
| Rekord nie znaleziony (nie dotyczy POST)   | 404    | N/A                       | — |
| Inne błędy                                 | 500    | INTERNAL_SERVER_ERROR     | fallback |

Błędy logujemy korzystając z `console.error` (w zależności od config), zawierając `requestId` z nagłówka.

## 8. Etapy wdrożenia
1. **Types & Schemas**  
   a. Zweryfikuj/dodaj `ErrorResponse` w `src/types.ts`.  
   b. Utwórz plik `src/lib/schemas/threads.schema.ts` z `createThreadSchema`.
2. **Service Layer**  
   a. Utwórz `src/lib/services/threads.service.ts` z funkcją `createThread` (opis w sekcji przepływu danych).  
   b. Dodaj helper `mapThreadRowToDTO()`.
3. **API Route**  
   a. Stwórz `/src/pages/api/threads/post.ts` (server-side only):
```ts
// export const prerender = false;
import type { APIContext } from "astro";
import { createThreadSchema } from "@/lib/schemas/threads.schema";
import { threadsService } from "@/lib/services/threads.service";

export async function POST(context: APIContext) {
  const { supabase, user } = context.locals;
  if (!user) return context.redirect("/login", 302); // or 401 JSON

  const body = await context.request.json();
  const parse = createThreadSchema.safeParse(body);
  if (!parse.success) {
    return context.response.json(
      { error: { code: "THREAD_NAME_INVALID", message: parse.error.message } },
      { status: 400 }
    );
  }

  try {
    const dto = await threadsService.createThread(supabase, user.id, parse.data.name);
    return context.response.json({ data: dto }, { status: 201 });
  } catch (err) {
    // map known errors → status codes
  }
}
```
4. **Error Mapping Utility** – `src/lib/errors/index.ts` (optional) to map service errors → HTTP.
5. **Unit Tests** – `threads.service.spec.ts` verifying duplicates / limit logic.
6. **API Integration Tests** – `tests/api/threads.post.spec.ts` using `vitest` + Supabase test db.
7. **Docs** – zaktualizuj OpenAPI / README.
8. **PR Review & Merge**.
