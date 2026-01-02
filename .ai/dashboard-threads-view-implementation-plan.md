# Plan implementacji widoku Dashboard Threads

## 1. Przegląd
Widok **Dashboard Threads** to główny ekran roboczy aplikacji FollowApp. Pozwala użytkownikowi:

1. Zarządzać zakładkami "wątków" (tworzyć nowe, przełączać się pomiędzy istniejącymi).
2. Wklejać długie transkrypcje spotkań (do 30 000 znaków) przypisane do aktywnego wątku.
3. Przygotować dane do późniejszego generowania Action Pointów (AP) – samo generowanie zostanie zaimplementowane w osobnym kroku.
4. Otrzymywać natychmiastowy feedback (toast, spinner) o stanie operacji bez przeładowania strony.

## 2. Routing widoku
- Ścieżka: `/threads/`
- Plik strony: `src/pages/threads/index.astro`
- Widok wymaga uwierzytelnionego użytkownika (guard w middleware sprawdza `context.locals.user`). W przypadku braku sesji – redirect do `/login`.

## 3. Struktura komponentów
```
DashboardThreadsPage (Astro, `<main>` landmark)
├── ThreadTabs (React)
│   ├── NewThreadModal (React, portal)
│   └── ThreadTab (React) × n
├── TextareaTranscript (React)
└── ControlsBar (React)
    ├── ButtonGenerate (React)
    └── SpinnerOverlay (React, portal)

ToastProvider (React, root-level)
AnchorSidebar (Astro / React – sticky nav anchor list)
```

## 4. Szczegóły komponentów
### ThreadTabs
- **Opis**: Pasek zakładek reprezentujących wątki użytkownika. Obsługuje przełączanie aktywnego wątku i otwieranie modala tworzenia nowego.
- **Elementy**: `Tabs` (shadcn/ui) + przycisk `+` otwierający `NewThreadModal`.
- **Zdarzenia**:
  - `onSelect(threadId)` – zmiana aktywnego wątku.
  - `onCreate()` – utworzenie nowego wątku (propagowane po udanym POST).
- **Walidacja**: brak (validacja w modalu).
- **Typy**: `ThreadDTO[]`, `ActiveThreadId: string | null`.
- **Propsy**: `{ threads, activeThreadId, onSelect, onCreate }`.

### NewThreadModal
- **Opis**: Modal z polem nazwy i przyciskami Zapisz/Anuluj.
- **Elementy**: `Dialog` (shadcn/ui), `Input`, `Button`.
- **Zdarzenia**:
  - `onSubmit(name)` – wysyła POST `/api/threads`.
- **Walidacja**:
  - nazwa 1‒20 znaków, niepusta.
  - unikalność sprawdzana po stronie API; obsłużyć 409.
- **Typy**: lokalny `FormState { name: string; error: string | null; isSubmitting: boolean }`.
- **Propsy**: `{ onClose }`.

### TextareaTranscript
- **Opis**: Duży obszar tekstowy na transkrypcję powiązaną z aktywnym wątkiem.
- **Elementy**: `textarea`, licznik znaków.
- **Zdarzenia**:
  - `onChange(value)` – aktualizuje `transcriptDraft` w stanie.
  - `onBlur` – (opcjonalnie) autosave (poza zakresem AP).
- **Walidacja**: max 30 000 znaków.
- **Typy**: `transcriptDraft: string`.
- **Propsy**: `{ value, onChange, maxLength }`.

### ControlsBar
- **Opis**: Pasek z przyciskiem `ButtonGenerate` i ewentualnie innymi kontrolkami (rozszerzalność).
- **Elementy**: `ButtonGenerate`, licznik znaków / status zapisania.
- **Propsy**: `{ disabled }` (przycisk generacji wyłączony, dopóki transkrypcja oznaczona jako "dirty").

### ButtonGenerate
- **Opis**: Wyzwala akcję generacji AP w przyszłości. Na razie wyświetla toast „Funkcja w przygotowaniu” i pozostaje disabled gdy `isTranscriptDirty`.
- **Zdarzenia**: `onClick` – wywołuje placeholder.
- **Walidacja**: Brak.
- **Propsy**: `{ disabled }`.

### SpinnerOverlay
- **Opis**: Pełnoekranowy pół-transparentny overlay ze spinnerem. Renderowany w portalu.
- **Propsy**: `{ visible, label? }`.

### ToastProvider
- **Opis**: Kontekst + pozycjonowany kontener toasts z shadcn/ui.
- **Propsy**: standardowe providerowe.

### AnchorSidebar
- **Opis**: Statyczny pasek kotwic do przewijania długiej transkrypcji (opcjonalnie, wersja MVP statyczna).
- **Propsy**: `{ anchors: Anchor[] }` (poza MVP – generowane z nagłówków transkrypcji).

## 5. Typy
- `ThreadDTO` – już istnieje w `src/types.ts`.
- `TranscriptDraft` (local):
  ```ts
  interface TranscriptDraft {
    threadId: string;      // aktywny wątek
    content: string;       // treść textarea
    isDirty: boolean;      // flaga zmian od ostatniego zapisu
  }
  ```
- `NewThreadFormValues` (local Zod schema): `{ name: string }` (1-20 znaków).

## 6. Zarządzanie stanem
- React Context `ThreadsContext` przechowujący:
  - `threads: ThreadDTO[]`
  - `activeThreadId: string | null`
  - `transcriptDraft: TranscriptDraft`
- Dostarczany w komponencie korzeniowym `DashboardThreadsPage`.
- Custom hook `useThreads()` do łatwego dostępu.
- Hook `useTranscriptAutosave` (później) – poza zakresem AP.

## 7. Integracja API
| Akcja | Endpoint | Metoda | Typ żądania | Typ odpowiedzi | Obsługa UI |
|-------|----------|--------|-------------|----------------|------------|
| Pobranie listy wątków | `/api/threads` | GET | – | `{ data: ThreadDTO[] }` | spinner until loaded, toast error |
| Utworzenie wątku | `/api/threads` | POST | `CreateThreadCommand` | `{ data: ThreadDTO }` | modal loading, zamknij i dodaj zakładkę |

## 8. Interakcje użytkownika
1. Klik „Nowy wątek” → otwiera `NewThreadModal`.
2. Wpisanie nazwy i Zapisz → loading → sukces: modal znika, nowa zakładka staje się aktywna.
3. Klik zakładki → aktywuje wątek, ładuje przypisaną transkrypcję (placeholder fetch w przyszłości).
4. Pisanie / wklejanie w textarea → aktualizuje `transcriptDraft`, ustawia `isDirty=true`, dezaktywuje `ButtonGenerate`.
5. Klik `ButtonGenerate` (gdy enabled) → toast „Funkcja w przygotowaniu”.

## 9. Warunki i walidacja
- `NewThreadModal` – nazwa 1-20 znaków (frontend + backend). Pusty string lub >20 znaków blokuje przycisk Zapisz.
- `TextareaTranscript` – limit `maxLength=30000`, licznik znaków zmienia kolor gdy >95 % limitu.
- `ButtonGenerate` – `disabled` gdy `isDirty` lub transkrypcja pusta.

## 10. Obsługa błędów
| Sytuacja | Komponent | Reakcja |
|----------|-----------|---------|
| 400 `THREAD_NAME_INVALID` | NewThreadModal | Wyświetl helper text „Nazwa musi mieć 1–20 znaków”. |
| 409 `THREAD_NAME_DUPLICATE` | NewThreadModal | Toast error „Wątek o takiej nazwie już istnieje”. |
| 429 `THREAD_LIMIT_REACHED` | NewThreadModal | Toast error „Limit wątków osiągnięty (20)”. |
| 500+ / sieć | dowolny fetch | Toast error ogólny + console.error |

## 11. Kroki implementacji
1. Stwórz stronę `src/pages/threads/index.astro` z guardem auth i kontenerem `<main>`.
2. Utwórz kontekst `ThreadsContext` (+ `useThreads` hook) w `src/components/hooks`.
3. Implementuj `ThreadTabs` w `src/components/ThreadTabs.tsx` z Shadcn `<Tabs>`.
4. Dodaj `NewThreadModal` z walidacją Zod; podłącz do POST `/api/threads`.
5. Stwórz `TextareaTranscript` w `src/components/TextareaTranscript.tsx` z limitem znaków.
6. Dodaj `ControlsBar` i `ButtonGenerate` placeholder w `src/components/ControlsBar.tsx`.
7. Dodaj `SpinnerOverlay` i `ToastProvider` w layoucie `_app.astro` (lub root React provider wrapper).
8. Zaimplementuj pobieranie początkowych wątków (useEffect w stronie) i obsługę błędów.
9. Dodaj logikę `isDirty` i odpowiednie blokowanie `ButtonGenerate`.
10. Styluj komponenty Tailwind + shadcn/ui; nadaj responsywność.
11. Przetestuj walidację, limity i UX; popraw błędy.
