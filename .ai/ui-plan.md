# Architektura UI dla FollowApp

## 1. Przegląd struktury UI
FollowApp to jednostronicowa aplikacja desktop-web (min. 1024 px) z układem „tabs-inside-page”. Po zalogowaniu użytkownik zarządza wątkami (threads), edytuje transkrypcje oraz listę Action Pointów (AP). Wszystkie operacje wykorzystują Supabase Auth oraz REST API opisane w planie API. Kluczowym wyróżnikiem jest sekcja transkrypcji współdzieląca widok z listą AP – oba obszary znajdują się na jednej stronie i są osiągalne przez zakotwiczone linki (`#transcript`, `#action-points`).

## 2. Lista widoków

| Widok | Ścieżka | Cel | Kluczowe informacje | Kluczowe komponenty | UX / A11y / Bezpieczeństwo |
|-------|---------|-----|---------------------|---------------------|----------------------------|
| Login | `/login` | Uwierzytelnienie użytkownika przez Supabase | Formularz e-mail + hasło, link resetu | `AuthForm`, `ButtonPrimary`, `ToastProvider` | Focus pierwszego pola, aria-live dla błędów, HTTPS, brak lokalnego tokena |
| Welcome | `/welcome` | Pusty stan przy braku wątków | Logo, opis, przycisk „Nowy wątek” | `EmptyState`, `ButtonPrimary` | Klucz do onboardingu, aria-describedby wyjaśnia akcję |
| Dashboard Threads | `/threads/:threadId` | Główna praca nad wątkiem | Zakładki wątków, sekcja Transkrypcja, sekcja AP, globalny toast | `ThreadTabs`, `TextareaTranscript`, `ButtonGenerate`, `APList`, `ToastProvider`, `SpinnerOverlay`, `AnchorSidebar` | Stałe ID aria-controls, blokada przycisku generacji gdy transcript dirty, kontenery landmark `<main>` |
| Modal Add Thread | (portal) | Tworzenie nowego wątku | Pole nazwy ≤20 znaków | `Modal`, `FormField`, `ButtonPrimary` | Live validation, aria-modal, escape to close |
| Modal Confirm Delete | (portal) | Potwierdzenie nieodwracalnej operacji | Tekst ostrzegawczy, Akceptuj / Anuluj | `Modal`, `ButtonPrimary/Secondary` | Focus trap, aria-describedby, brak toast-undo (irreversible) |
| Modal Add / Edit AP | (portal) | Dodawanie ręcznego AP lub edycja istniejącego | Pole tytułu ≤ 255 znaków, checkbox status | `Modal`, `FormField`, `Checkbox`, `ButtonPrimary` | Live char counter, aria-live errors |
| Global Toast Center-Top | (layout) | Komunikaty sukces/ błąd / timeout AI | Kod błędu ↔ tekst mapowany | `ToastProvider`, `ToastItem` | aria-live polite, auto-dismiss 5 s |
| Spinner Overlay | (layout) | Blokada UI podczas generacji | Semi-transparent overlay, animacja | `SpinnerOverlay` | aria-busy na `<main>`, role=status |

## 3. Mapa podróży użytkownika

1. Użytkownik otwiera aplikację  
   a. Brak sesji → przekierowanie do Login  
   b. Sesja aktywna → `/threads`  
2. Login → submit → Supabase Auth → redirect do `/threads`
3. GET `/api/threads`  
   • 0 wątków → `/welcome`  
   • ≥1 wątek → `/threads/{firstId}`  
4. Tworzenie wątku: "+" w tabach lub przycisk w Welcome  
   • Modal Add Thread → POST `/api/threads` → toast success → tabs refresh → automatyczne przeniesienie do nowej zakładki  
5. Wklej transkrypcję (`#transcript`)  
   • textarea onBlur → POST `/api/threads/{id}/transcripts`  
6. Klik „Generuj”  
   • POST `/api/transcripts/{id}/generate-action-points` (jobId)  
   • SpinnerOverlay + polling GET `/api/generations/{jobId}` co 5 s  
   • Done → GET `/api/threads/{id}/action-points` → render list → toast success  
7. Edycja AP (inline) → PATCH `/api/action-points/{id}` (onBlur)  
8. Checkbox status → PATCH (debounced)  
9. Dodaj AP → Modal Add AP → POST `/api/threads/{id}/action-points`  
10. Kasowanie AP / Thread → Modal Confirm Delete → DELETE → toast success  
11. Logout via user menu → Supabase signOut → redirect `/login`

## 4. Układ i struktura nawigacji

- Górny pasek (`<header>`) z logo i menu użytkownika (dropdown: Logout).  
- Poniżej pasek zakładek wątków (`ThreadTabs`) z przyciskiem „＋” po prawej; horizontal scroll przy >10 tabs.  
- Treść (`<main>`) z dwiema sekcjami w układzie pionowym:  
  1. Transkrypcja (textarea + przyciski) – id=`transcript`  
  2. Action Pointy (lista, przycisk „Dodaj AP”) – id=`action-points`  
- Linki z paska bocznego/anchorów umożliwiają szybki scroll do sekcji.  
- Portal root (`#modal-root`) utrzymuje wszystkie modale z trapem focusu.  
- `ToastProvider` osadzony na poziomie Layoutu zapewnia globalne komunikaty.

## 5. Kluczowe komponenty wielokrotnego użytku

| Komponent | Rola | Użycie |
|-----------|------|--------|
| ThreadTabs | Wyświetla zakładki wątków + „＋” | Dashboard |
| TextareaTranscript | Edycja i autosave transkrypcji | Dashboard |
| ButtonGenerate | Akcje „Generuj / Generuj ponownie”, blokada przy dirty | Dashboard |
| APList & ActionPointItem | Lista AP z checkboxem, inline edit, trash | Dashboard |
| Modal | Kontener dialogów (Add Thread, Add AP, Confirm) | Wszystkie widoki modalne |
| SpinnerOverlay | Blokada UI podczas długich jobów | Dashboard |
| ToastProvider / ToastItem | Globalne powiadomienia | Cała aplikacja |
| AuthGuard | Redirectuje nieautoryzowanych | Wszystkie strony prywatne |
| ErrorBoundary | Wyłapuje nieobsłużone wyjątki React | Cała aplikacja |
