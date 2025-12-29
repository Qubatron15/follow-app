<conversation_summary>

<matched_recommendations>

Landing logic „welcome screen ↔ pierwsza zakładka” (zaakceptowana).
Sekcje w obrębie jednego widoku wątku z kotwicami hash (zaakceptowana).
Modal potwierdzający destrukcję zamiast toast-undo (zaakceptowana).
Stała wysokość tekstarea + scrollbar (zaakceptowana).
Toast błędu z mapowaniem kodów (zaakceptowana).
Walidacja 255 znaków dla AP title w UI (zaakceptowana).
Blokada przycisku generacji gdy transkrypcja „dirty” (zaakceptowana).
OnBlur autosave dla edycji AP (zaakceptowana).
</matched_recommendations>
<ui_architecture_planning_summary> a. Główne wymagania UI

Aplikacja desktop-web z zakładkami wątków.
Brak obsługi trybu ciemnego, WCAG, i18n ani mobilnych rozdzielczości <1024 px.
Sesja użytkownika via HttpOnly cookie; po odświeżeniu pobieramy aktualne dane z API.
b. Kluczowe widoki i przepływy

Logowanie (Supabase auth).
Ekran powitalny (gdy brak wątków) z przyciskiem „Nowy wątek”.
Widok zakładek wątków:
  • Sekcja Transkrypcja (tekstarea) + akcje „Generuj” / „Generuj ponownie”.
  • Sekcja Action Pointy (lista wszystkich AP, checkbox status, onBlur edycja).
  • Modal dodania nowego AP.
Modal potwierdzający kasowanie wątku lub AP.
Globalny toast center-top: stany błędów, sukcesy, timeout AI.
c. Integracja z API & zarządzanie stanem

Natywny React state + efekty useEffect / fetch dla CRUD.
Brak TanStack Query; pełne odświeżenie danych po reload.
Polling /api/generations/{jobId} co 5 s do zakończenia; spinner w czasie oczekiwania.
Globalny limit generacji wymuszany przez backend; UI nie synchronizuje stanu między kartami.
d. Responsywność, dostępność, bezpieczeństwo

Układ desktop-first ≥1024 px; brak dodatkowych breakpointów.
Minimalne ARIA zapewnione przez Shadcn/ui, ale brak formalnego WCAG AA.
HttpOnly cookie zabezpiecza token przed XSS; brak LocalStorage.
Błędy API przedstawiane w toastach; brak przeglądarkowego ostrzeżenia o utracie danych (zrezygnowano).
e. Nierozwiązane kwestie

Mechanizm sortowania zakładek (alfabetycznie czy chronologicznie).
Szczegółowy design identyfikatora spinnera/progresu dla wielu jobów (jeśli backend zwróci kolejkę).
Strategia paginacji / wirtualizacji przy potencjalnie dużych listach AP (> 1000) – obecnie renderujemy całość.
Potencjalne monitorowanie metryk sukcesu (M-02) po stronie klienta lub innego modułu.
</ui_architecture_planning_summary>

<unresolved_issues>

Brak określonego kryterium sortowania zakładek wątków.
Brak planu dla bardzo dużych list Action Pointów (wydajność renderu).
Niewyjaśniona prezentacja wielu równoległych spinnerów, jeśli backend mimo limitu zwróci kilka jobów w kolejce.
</unresolved_issues>
</conversation_summary>