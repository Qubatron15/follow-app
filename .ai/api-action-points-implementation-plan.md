# API Endpoint Implementation Plan: Action Points Endpoints

## 1. Przegląd punktu końcowego
"Action Point" (AP) stanowi pojedyncze zadanie do wykonania wynikające z rozmowy prowadzonej w ramach wątku (`threads`). Zestaw czterech endpointów REST pozwala użytkownikowi:
1. Odczytać listę AP-ów w wybranym wątku (filtrowanie po `isCompleted`).
2. Dodać nowy AP ręcznie do wątku.
3. Zmodyfikować treść lub oznaczyć AP jako ukończony / nieukończony.
4. Trwale usunąć AP.

Każda operacja podlega BOLA – można pracować wyłącznie na wątkach i AP-ach należących do zalogowanego użytkownika.

## 2. Szczegóły żądania
### 2.1 GET /api/threads/{threadId}/action-points
- **Metoda HTTP:** `GET`
- **URL:** `/api/threads/{threadId}/action-points`
- **Parametry ścieżki:**
  - `threadId : UUID` – identyfikator wątku (wymagany)
- **Query params:**
  - `completed : boolean` – filtr ukończenia (`true|false`), opcjonalny

### 2.2 POST /api/threads/{threadId}/action-points
- **Metoda HTTP:** `POST`
- **URL:** `/api/threads/{threadId}/action-points`
- **Parametry ścieżki:** jak wyżej
- **Body (JSON):**
```json
{
  "title": "Send updated roadmap",    // string ≤255 znaków
  "isCompleted": false                 // boolean opcjonalny, domyślnie false
}
```

### 2.3 PATCH /api/action-points/{apId}
- **Metoda HTTP:** `PATCH`
- **URL:** `/api/action-points/{apId}`
- **Parametry ścieżki:** `apId : UUID`
- **Body (JSON):** dowolna kombinacja pól:
```json
{
  "title": "Updated title",           // string ≤255
  "isCompleted": true                 // boolean
}
```

### 2.4 DELETE /api/action-points/{apId}
- **Metoda HTTP:** `DELETE`
- **URL:** `/api/action-points/{apId}`
- **Parametry ścieżki:** `apId : UUID`

## 3. Wykorzystywane typy
| Nazwa | Plik | Zastosowanie |
|-------|------|--------------|
| `ActionPointDTO` | `src/types.ts` | Odpowiedzi API |
| `CreateActionPointCommand` | `src/types.ts` | Body POST |
| `UpdateActionPointCommand` | `src/types.ts` | Body PATCH |
| `ErrorResponse` | `src/types.ts` | Standard błędu |

## 4. Szczegóły odpowiedzi
| Endpoint | Status | Body |
|----------|--------|------|
| GET list | 200 | `{ "data": ActionPointDTO[] }` |
| POST | 201 | `{ "data": ActionPointDTO }` |
| PATCH | 200 | `{ "data": ActionPointDTO }` |
| DELETE | 204 | brak contentu |
| *dowolny* | 400 | `ErrorResponse` (walidacja) |
| *dowolny* | 401 | `ErrorResponse` (brak auth) |
| *dowolny* | 404 | `ErrorResponse` (nie znaleziono) |
| *dowolny* | 500 | `ErrorResponse` (server) |

## 5. Przepływ danych
1. Middleware (`src/middleware/index.ts`) ustawia `supabase` i `user` w `context.locals`.
2. Astro route odbiera request i:
   1. Waliduje UUID-y z path/query (`uuidSchema` + `booleanStringSchema`).
   2. Waliduje body (`createActionPointSchema` / `updateActionPointSchema`).
   3. Wywołuje odpowiednią metodę `actionPointsService` przekazując `supabase`, `user.id`, inne parametry.
3. `ActionPointsService` wykonuje zapytania do tabeli `action_points` z weryfikacją własności rekordu (`thread.user_id === user.id`).
4. Service mapuje wynik do `ActionPointDTO`.
5. Route mapuje/zwraca odpowiedź, albo błąd poprzez `mapServiceErrorToHttpResponse`.

## 6. Względy bezpieczeństwa
- **Auth:** Wymagany zalogowany użytkownik (Supabase Auth).
- **BOLA:** Każde zapytanie sprawdza, czy `threads.user_id === user.id`.
- **Walidacja:** `zod` + ograniczenia długości, typów → minimalizuje ryzyko XSS/DOS.
- **RLS:** Produkcyjnie RLS w Supabase na `action_points` (w dev wyłączone).
- **Rate-limiting:** Do rozważenia w middleware.

## 7. Obsługa błędów
| Kod aplikacyjny | HTTP | Scenariusz |
|-----------------|------|------------|
| `ACTION_POINT_NOT_FOUND` | 404 | AP nie istnieje lub nie należy do usera |
| `THREAD_NOT_FOUND` | 404 | Wątek nie istnieje lub nie należy do usera |
| `ACTION_POINT_TITLE_INVALID` | 400 | Title pusty / >255 |
| `VALIDATION_ERROR` | 400 | Ogólna walidacja Zod |
| `AUTH_REQUIRED` | 401 | Brak sesji |
| `INTERNAL_SERVER_ERROR` | 500 | Błąd niespodziewany |

## 8. Rozważania dotyczące wydajności
- Batch update/patch pojedynczy – ramy.

## 9. Etapy wdrożenia
1. **Typy** – `src/types.ts` już zawiera DTO/Command; zweryfikuj.
2. **Schemas** – dodaj `src/lib/schemas/action-points.schema.ts`:
```ts
export const ACTION_POINT_ERRORS = { ... };
export const createActionPointSchema = z.object({
  title: z.string().trim().min(1).max(255, ACTION_POINT_ERRORS.ACTION_POINT_TITLE_INVALID),
  isCompleted: z.boolean().optional().default(false),
});
export const updateActionPointSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  isCompleted: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: ACTION_POINT_ERRORS.VALIDATION_ERROR });
```
3. **Service** – `src/lib/services/action-points.service.ts` (wzorować się na `transcripts.service.ts`):
   - `list(supabase, userId, threadId, completed?)`
   - `create(supabase, userId, threadId, title, isCompleted)`
   - `update(supabase, userId, apId, partial)`
   - `remove(supabase, userId, apId)`
4. **Error Mapping** – rozszerz `src/lib/errors/index.ts` (ACTION_POINT_ERRORS).
5. **Routes** – utwórz:
   - `src/pages/api/threads/[threadId]/action-points/index.ts` (`GET` + `POST`)
   - `src/pages/api/action-points/[apId].ts` (`PATCH` + `DELETE`)
6. **Indeksy DB** – migracja SQL: `create index on action_points(thread_id, is_completed, created_at desc);`
7. **Testy** – service (unit) + endpoint (integration) z Supabase test DB.
8. **Dokumentacja** – aktualizacja OpenAPI / README.
9. **PR + Code Review + Deploy**.
