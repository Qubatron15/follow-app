# Transcripts API – Summary

## 1. Specyfikacja endpointów
| Metoda | Ścieżka | Opis |
|--------|---------|------|
| GET | `/api/threads/{threadId}/transcripts` | Zwraca listę transkrypcji wątku (paginacja) |
| POST | `/api/threads/{threadId}/transcripts` | Dodaje nową transkrypcję do wątku |
| GET | `/api/transcripts/{transcriptId}` | Pobiera pojedynczą transkrypcję |
| DELETE | `/api/transcripts/{transcriptId}` | Usuwa transkrypcję |

## 2. Parametry
**Wymagane**
- `threadId: UUID` – dla listy i tworzenia
- `transcriptId: UUID` – dla pobierania i usuwania
- `content: string (1-30 000)` – body dla POST

**Opcjonalne (lista)**
- `page: number` – numer strony
- `limit: number` – rozmiar strony

## 3. DTO & Command modele
| Nazwa | Plik | Rola |
|-------|------|------|
| `TranscriptDTO` | `src/types.ts` | Obiekt odpowiedzi |
| `CreateTranscriptCommand` | `src/types.ts` | Body POST |
| `PaginatedResponse<T>` | (do dodania) | Opakowanie listy |
| `ServiceErrorCode` | `src/lib/errors` | Kody domenowe |

## 4. Warstwa serwisowa (nowy plik `src/lib/services/transcripts.service.ts`)
- `list(supabase, userId, threadId, page, limit)`
- `create(supabase, userId, threadId, content)`
- `get(supabase, userId, transcriptId)`
- `remove(supabase, userId, transcriptId)`

Każda metoda weryfikuje własność wątku/transkrypcji.

## 5. Walidacja (`src/lib/schemas/transcripts.schema.ts`)
```ts
export const createTranscriptSchema = z.object({
  content: z.string().trim().min(1).max(30_000),
});
```
Dodatkowe schematy: `uuidSchema`, `paginationSchema`.

## 6. Logowanie błędów
- Używać `console.error` / Sentry z identyfikatorem `requestId`, `userId`, `route`.
- W przyszłości tabela `error_logs` (poza zakresem).

## 7. Zagrożenia bezpieczeństwa
- **BOLA**: sprawdzanie właściciela wątku/transkrypcji.
- Payload DOS: limit 30 000 znaków + limit rozmiaru żądania.
- XSS/SQLi: trim + Supabase query builder.
- Rate limiting na POST/DELETE (middleware).

## 8. Scenariusze błędów
| Scenariusz | Status | Kod aplikacyjny |
|------------|--------|-----------------|
| Niepoprawny UUID / body | 400 | VALIDATION_ERROR |
| Brak autentykacji | 401 | AUTH_REQUIRED |
| Wątek nie znaleziony / obcy | 404 | THREAD_NOT_FOUND |
| Transkrypcja nie znaleziona / obca | 404 | TRANSCRIPT_NOT_FOUND |
| Sukces list/get | 200 |
| Sukces create | 201 |
| Sukces delete | 200/204 |
| Błąd DB / nieznany | 500 | INTERNAL_SERVER_ERROR |
