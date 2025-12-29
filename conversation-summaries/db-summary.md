<conversation_summary>

Encja threads jest przypisana do konkretnego user_id; RLS zapewnia, że użytkownik widzi tylko własne rekordy (brak dodatkowych ról).
Nazwa wątku (threads.name) musi być unikalna wyłącznie w obrębie użytkownika i rozróżnia wielkość liter (case-sensitive).
Limit wątków na użytkownika: maks. 20; egzekwowany przez trigger BEFORE INSERT w threads.
Usuwanie jest twarde (hard DELETE); kaskadowe (ON DELETE CASCADE) z threads do transcripts i action_points.
Transkrypcje nie są edytowalne po zapisaniu; brak pola updated_at ani logów AI/zdarzeń.
Transkrypcje przechowujemy wyłącznie jako TEXT; baza nie wymusza limitu 30 000 znaków.
Action Pointy mają dwa stany prezentowane checkboxem – kolumna is_completed BOOLEAN NOT NULL DEFAULT FALSE; brak pola completed_at.
Tytuł Action Pointa (action_points.title) ograniczony do VARCHAR(255).
Domyślne sortowanie listy AP w wątku po created_at; brak dodatkowych indeksów, full-text search ani widoków.
Brak ograniczania liczby aktywnych sesji, danych multi-tenant, archiwizacji wątków ani pól last_activity_at.
<matched_recommendations>

Dodanie klucza obcego threads.user_id z RLS (auth.uid() = user_id) – przyjęto.
Kaskadowe usuwanie z threads do powiązanych tabel – przyjęto.
Trigger blokujący wstawienie > 20 wątków na użytkownika – przyjęto.
Pole is_completed BOOLEAN DEFAULT FALSE w action_points – przyjęto.
Ograniczenie długości nazwy AP do 255 znaków (VARCHAR(255)) – przyjęto.
Brak soft-delete, pól completed_at, updated_at, logów AI, pełnotekstowego indeksu, last-activity, eksportów i archiwizacji – odrzucono. </matched_recommendations>
<database_planning_summary> Schemat MVP będzie składał się z czterech głównych tabel:

users – identyfikator z Supabase Auth (bez dodatkowych pól profilowych).
threads – id, user_id FK, name VARCHAR(20), created_at. Unikalność (user_id, name) jest case-sensitive. Trigger egzekwuje limit 20 wątków na użytkownika. Usunięcie wątku kasuje powiązane dane.
transcripts – id, thread_id FK, content TEXT, created_at. Brak edycji, brak wymuszanego limitu znaków, brak pól stanu/przetwarzania.
action_points – id, thread_id FK, title VARCHAR(255), is_completed BOOLEAN DEFAULT FALSE, created_at. Brak completed_at. Lista w UI sortowana według created_at.
Relacje:
users 1-N threads → threads 1-N transcripts oraz threads 1-N action_points.

Bezpieczeństwo:
Row-Level Security w każdej tabeli na zasadzie auth.uid() = user_id (lub poprzez złączenie przez threads.user_id), bez odrębnych ról administracyjnych. Brak logów audytowych i dodatkowych polityk.

Skalowalność i wydajność:
Przy zakładanym limicie 20 wątków i braku intensywnych zapytań wyszukujących wystarczą domyślne indeksy kluczy głównych i obcych. Dodatkowe indeksy (np. na created_at) uznano za zbędne, lecz mogą zostać dodane później bez migracji danych.

Nierozważane elementy: brak archiwizacji, eksportu danych, full-text search, last-activity tracking, soft-delete, multi-tenant organizacji, czy pojedynczej sesji logowania. </database_planning_summary>

<unresolved_issues>

Czy kaskadowe usunięcie użytkownika (np. przez Supabase) powinno automatycznie usuwać jego wątki i dane?
Czy potrzebujemy dodatkowych constraintów (np. minimalna długość nazwy wątku) czy zostają wymuszone wyłącznie w warstwie UI?
Jak obsłużyć potencjalną konieczność przywracania przypadkowo usuniętych danych w przyszłości (brak soft-delete)? </unresolved_issues> </conversation_summary>
