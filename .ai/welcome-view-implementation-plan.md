# Plan implementacji widoku Welcome

## 1. Przegląd
Widok **Welcome** stanowi ekran powitalny aplikacji FollowApp wyświetlany tylko wtedy, gdy zalogowany użytkownik nie posiada jeszcze żadnych wątków. Celem widoku jest przekazanie jasnej informacji „co dalej” oraz zachęcenie do rozpoczęcia pracy poprzez wyraźny przycisk „Nowy wątek”. Komponent zapewnia zgodność z dostępnością (ARIA) i jest kluczowym krokiem w procesie onboardingu.

## 2. Routing widoku
- Ścieżka URL: `/welcome`
- Renderowany po stronie serwera (SSR) przy użyciu **Astro**.
- Middleware przekierowuje na `/welcome`, jeżeli zapytanie do `GET /api/threads` zwraca pustą listę.

## 3. Struktura komponentów
```
<WelcomePage>
 ├─ <EmptyState>
 │   ├─ <Logo /> (statyczny obraz SVG/PNG)
 │   ├─ <p>Opis funkcjonalności</p>
 │   └─ <ButtonPrimary>Nowy wątek</ButtonPrimary>
 └─ (Opcjonalnie) <LoadingSpinner /> / <ErrorAlert />
```

## 4. Szczegóły komponentów
### 4.1 WelcomePage
- **Opis:** Komponent–strona odpowiedzialny za pobranie wątków użytkownika i zdecydowanie czy wyświetlić `EmptyState`.
- **Elementy:** `EmptyState`, `LoadingSpinner`, `ErrorAlert`.
- **Interakcje:**
  - `onMount` (Hydration React) wywołuje `useThreads()`.
  - W przypadku braku wątków renderuje `EmptyState`; jeśli istnieją, przekierowuje do `/threads/{id}` (pierwszy thread).
- **Walidacja:** brak lokalnej walidacji.
- **Typy:** `ThreadDTO[]`, `WelcomeViewModel`.
- **Propsy:** brak.

### 4.2 EmptyState
- **Opis:** Prezentuje pusty stan aplikacji z logo, opisem oraz CTA „Nowy wątek”.
- **Elementy:**
  - `<img alt="FollowApp logo" />`
  - `<p>` opis funkcji
  - `<ButtonPrimary>`
- **Interakcje:** kliknięcie „Nowy wątek” otwiera modal tworzenia wątku (`showCreateThreadModal(true)`).
- **Walidacja:** a11y – `aria-describedby` przycisku opisujące akcję.
- **Typy:** brak nowych.
- **Propsy:**
  - `onCreateThread: () => void`  – callback do rodzica.

### 4.3 ButtonPrimary (re-use)
- **Opis:** Uniwersalny przycisk zgodny z design systemem (Shadcn/ui variant „primary”).
- **Elementy:** `<button>` z klasami Tailwind i wariantami.
- **Interakcje:** `onClick` przekazuje event do rodzica.
- **Walidacja:** brak.
- **Typy:** dziedziczy `React.ButtonHTMLAttributes<HTMLButtonElement>`.
- **Propsy:** `children`, `onClick`, `disabled`.

### 4.4 CreateThreadModal (do użytku globalnego, niewymagany w samym widoku)
- **Opis:** Modal umożliwiający utworzenie nowego wątku.
- **Elementy:** `<input name="name" />`, `<ButtonPrimary>` (Zapisz), `FormError`.
- **Interakcje:**
  - Submit => `POST /api/threads`.
- **Walidacja:**
  - 1–20 znaków, niepusta wartość.
- **Typy:** `CreateThreadCommand`, `ThreadDTO`.
- **Propsy:** `isOpen`, `onClose`, `onThreadCreated(thread: ThreadDTO)`.

## 5. Typy
```
// view-models.ts
export interface WelcomeViewModel {
  isLoading: boolean;
  error: string | null;
  threads: ThreadDTO[];
}
```
**Dodatkowe:**
- `CreateThreadCommand` i `ThreadDTO` znajdują się już w `src/types.ts` i powinny być importowane.

## 6. Zarządzanie stanem
- Custom hook **`useThreads()`** (`src/components/hooks/useThreads.ts`)
  - Stan: `{ data: ThreadDTO[]; isLoading: boolean; error: string | null }`.
  - Pobiera wątki raz przy mount, wykorzystuje `fetch('/api/threads')`.
  - Zapewnia refetch po dodaniu nowego wątku.
- `WelcomePage` wykorzystuje hook i na podstawie stanu decyduje o renderze `EmptyState` lub redirekcie.
- Dodatkowy hook **`useCreateThread()`** do obsługi POST z optimistic UI.

## 7. Integracja API
- **GET /api/threads**
  - Response: `{ data: ThreadDTO[] }`  – import `ThreadDTO`.
  - Błędy 401/500 → obsługa w `useThreads()`.
- **POST /api/threads** (z modalu)
  - Body: `CreateThreadCommand` (`{ name: string }`).
  - Success 201 → zamknięcie modalu i refetch wątków.
  - Błędy 400/409/429 → wyświetlenie w `FormError`.

## 8. Interakcje użytkownika
| Akcja | Rezultat |
|-------|----------|
| Wejście na `/welcome` | Widok ładuje dane. Jeśli brak wątków → `EmptyState`; inaczej następuje przekierowanie. |
| Klik „Nowy wątek” | Otwiera `CreateThreadModal`. |
| Submit w modalu (poprawny) | Tworzy wątek, modal się zamyka, następuje redirect do `/threads/{newId}`. |
| Submit w modalu (błąd walidacji) | Pokazuje komunikat błędu pod polem. |

## 9. Warunki i walidacja
- **Pole nazwy wątku**: 1–20 znaków, unikalna – weryfikowana serwerowo.
- **Weryfikacja dostępności**: `aria-describedby` przycisku, role `dialog` w modalu.

## 10. Obsługa błędów
- Błędy sieciowe przy `GET /api/threads` → komponent `ErrorAlert` z przyciskiem „Spróbuj ponownie”.
- 401 → przekierowanie do `/login`.
- 400/409/429 z POST → komunikat w modalu (`THREAD_NAME_INVALID`, `THREAD_NAME_DUPLICATE`, `THREAD_LIMIT_REACHED`).
- 500 → toast ogólny „Wystąpił nieoczekiwany błąd”.

## 11. Kroki implementacji
1. Utwórz stronę `src/pages/welcome.astro` z placeholderem.
2. Zaimplementuj hook `useThreads()` wraz z typami w `src/components/hooks`.
3. Dodaj przekierowanie w `welcome.astro` po pozytywnym pobraniu wątków.
4. Utwórz komponent `EmptyState.astro` (statyczny) w `src/components`.
5. Stwórz komponent `ButtonPrimary.tsx` (jeśli jeszcze nie istnieje) oparty na Shadcn/ui.
6. Dodaj modal `CreateThreadModal.tsx` wraz z walidacją przy pomocy Zod.
7. Zaimplementuj hook `useCreateThread()` z optimistic UI i obsługą błędów.
8. Dodaj middleware (`src/middleware/redirectEmptyThreads.ts`) – jeśli user ma `0` wątków i nie jest już na `/welcome`, przekieruj.
9. Dodaj testy jednostkowe hooków oraz komponentów przy użyciu React Testing Library.
10. Uzupełnij dokumentację w README oraz Storybook stories dla `EmptyState` i `CreateThreadModal`.
