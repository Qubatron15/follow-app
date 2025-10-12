# Dokument wymagań produktu (PRD) - FollowApp
## 1. Przegląd produktu
1. Cel produktu: Dostarczyć menedżerom korporacyjnym narzędzie do śledzenia wątków projektowych oraz action pointów wynikających z wielu spotkań, redukując ręczną pracę i chaos informacyjny.
2. Docelowy użytkownik: Menedżerowie projektów i programów w dużych organizacjach, pracujący hybrydowo, prowadzący liczne spotkania statusowe i potrzebujący jednego źródła prawdy.
3. Propozycja wartości: Centralizacja historii wątków oraz przejrzysty panel bieżących zadań.
4. Zakres MVP: Jednoosobowe konto z logowaniem, tworzenie i przełączanie wątków, ręczne wklejanie transkrypcji, przetwarzanie AI, edycja listy action pointów, historia spotkań, przechowywanie danych w lokalnej bazie danych.
5. Harmonogram i zasoby: Realizacja przez jednego dewelopera przy wsparciu AI z terminem na połowę grudnia, uwzględniająca test z menedżerem w MS Teams i jeden scenariusz end-to-end.
6. Kluczowe zależności: Dostęp do API OpenAI z automatycznym rozpoznawaniem języka (PL/EN), lokalna baza danych (np. SQLite), środowisko przeglądarkowe.

## 2. Problem użytkownika
1. Menedżerowie śledzą równolegle wiele wątków i action pointów, co prowadzi do utraty kontekstu i duplikacji pracy.
2. Ręczne aktualizowanie list po spotkaniach jest czasochłonne, podatne na błędy i często odkładane w czasie.
3. Niepowodzenia w szybkim aktualizowaniu statusów obniżają zaufanie do zespołu i powodują, że menedżerowie tracą kontrolę nad priorytetami.

## 3. Wymagania funkcjonalne
### 3.1 Uwierzytelnianie
1. Aplikacja wymaga logowania użytkownika przed dostępem do danych, sesje są utrzymywane do wylogowania lub wygaśnięcia.
2. Obsługa wielu kont; każdy użytkownik ma własne wątki i historię spotkań.

### 3.2 Zarządzanie wątkami
1. Użytkownik widzi listę wątków w formie zakładek, posortowanych chronologicznie według utworzenia.
2. Pusty stan aplikacji prezentuje ekran powitalny z przyciskiem Nowy wątek.
3. Nazwa wątku jest wymagana, unikalna i ograniczona do 20 znaków; aplikacja waliduje przekroczenie limitu i duplikaty.
4. Usunięcie wątku jest dostępne w MVP; wątki można aktywować przez wybór zakładki.

### 3.3 Transkrypcje spotkań
1. Użytkownik wkleja transkrypcję w dedykowany edytor tekstowy (limit 30 000 znaków, walidacja wejścia).
2. Każda transkrypcja jest przypisana do aktywnego wątku i oznaczona datą dodania.
3. Transkrypcje nie są przechowywane w lokalnej bazie
4. Rezultatem przetwarzania transkrypcji przez AI są action pointy przechowywane w bazie danch.

### 3.4 Przetwarzanie przez AI
1. Przycisk Generuj Action Pointy uruchamia przetwarzanie treści transkrypcji z wykorzystaniem modelu OpenAI z automatycznym wykrywaniem języka (PL/EN).
2. Maksymalny czas oczekiwania na wynik jednej operacji wynosi 10 minut; interfejs pokazuje stan działania.
3. Aplikacja udostępnia przycisk Generuj ponownie, który ponawia przetwarzanie najnowszej transkrypcji i nadpisuje propozycję AI.
4. Użytkownik samodzielnie aktualizuje statusy istniejących action pointów (poprzez zaznaczenie checkboxa).
5. AI proponuje nowe pozycje wraz z krótkim opisem.
6. W przypadku błędu AI aplikacja wyświetla czytelny komunikat, zachowuje transkrypcję i ostatnie action pointy bez zmian.

### 3.5 Zarządzanie action pointami
1. Lista action pointów wyświetla status (checkbox) i tytuł.
2. Użytkownik może oznaczać statusy action pointów, edytować tytuł oraz dodawać własne pozycje niezależnie od AI.
3. Użytkownik może usuwać action pointy; operacja jest trwała i potwierdzana komunikatem.
4. Wszystkie zmiany użytkownika są zapisywane w lokalnej bazie.

### 3.6 Historia spotkań
1. Historia wątku prezentuje listę transkrypcji w kolejności chronologicznej malejącej, każda pozycja jest rozwijalną sekcją z datą.
2. W ramach historii każdej transkrypcji wyświetlane są wygenerowane i ręcznie dodane action pointy wraz ze statusem.
3. Nie jest możliwe filtrowanie po statusie action pointów i wyszukiwanie po tekście transkrypcji.

### 3.7 Przechowywanie danych
1. Dane (wątki, action pointy, statusy checkboxów) są przechowywane lokalnie w lokalnej bazie; nie są tworzone kopie zapasowe w ramach mechanizmu eksportu/importu pliku (CSV/JSON).
2. Dane są dostępne offline, jeśli użytkownik ma aktywną sesję i aplikacja jest otwarta (cache przeglądarkowy).

### 3.8 Doświadczenie użytkownika i dostępność
1. Interfejs jest przystosowany do pracy w przeglądarce desktopowej, z responsywnością do szerokości minimum 1280 px.
2. Stany ładowania, sukcesu i błędów są wizualnie rozróżnialne i opisane tekstowo.

## 4. Granice produktu
### 4.1 Poza zakresem MVP
1. Integracje z kalendarzami, komunikatorami (Teams, Slack) i systemami zarządzania zadaniami (Jira, Asana) są wyłączone.
2. Brak analizy tonu, nastroju lub sentymentu w transkrypcjach.
3. Brak wersji mobilnych (native lub PWA) oraz optymalizacji dla ekranów poniżej 1024 px.
4. Brak systemu powiadomień push/email oraz przypomnień.
5. Brak współdzielenia wątków między użytkownikami i ról zespołowych.
6. Brak logów zmian i wymogów RODO poza lokalnym przechowywaniem.

### 4.2 Założenia i ograniczenia
1. Dostęp do API OpenAI jest stabilny i spełnia wymagania SLA 10 minut na przetwarzanie.
2. Użytkownik jest odpowiedzialny za poprawność i kompletność transkrypcji wklejanych do aplikacji.
3. System operuje na danych tekstowych w języku polskim i angielskim; inne języki nie są wspierane w MVP.
4. Przeglądarka użytkownika komunikuje się z backendem, który zapisuje dane w bazie.

## 5. Historyjki użytkowników
### US-001 Logowanie użytkownika
ID: US-001
Tytuł: Logowanie użytkownika
Opis: Jako menedżer chcę logować się do aplikacji, aby moje dane były zabezpieczone.
Kryteria akceptacji:
- Formularz logowania wymaga poprawnego loginu i hasła przed uzyskaniem dostępu.
- Błędne dane powodują komunikat o błędzie i brak dostępu do aplikacji.
- Po wylogowaniu użytkownik nie ma dostępu do żadnych danych bez ponownego logowania.

### US-002 Pusty stan i tworzenie wątku
ID: US-002
Tytuł: Pusty stan i tworzenie wątku
Opis: Jako nowy użytkownik chcę zobaczyć jasny pusty stan i móc utworzyć pierwszy wątek.
Kryteria akceptacji:
- Po zalogowaniu i braku wątków wyświetlany jest ekran z opisem i przyciskiem Nowy wątek.
- Próba zapisania wątku bez nazwy powoduje komunikat walidacyjny.
- Nazwa wątku dłuższa niż 20 znaków jest blokowana i informuje użytkownika o limicie.

### US-003 Przełączanie i nawigacja między wątkami
ID: US-003
Tytuł: Przełączanie i nawigacja między wątkami
Opis: Jako menedżer chcę szybko przełączać się między wątkami, aby kontrolować wiele inicjatyw.
Kryteria akceptacji:
- Lista zakładek pokazuje wszystkie wątki użytkownika i pozwala na wybór aktywnego.
- Aktywny wątek jest wizualnie wyróżniony.
- Przełączenie zakładki aktualizuje panel action pointów w czasie rzeczywistym.

### US-004 Dodanie transkrypcji do wątku
ID: US-004
Tytuł: Dodanie transkrypcji do wątku
Opis: Jako menedżer chcę wkleić transkrypcję spotkania, aby aplikacja mogła ją przetworzyć.
Kryteria akceptacji:
- Pole transkrypcji przyjmuje tekst do 30 000 znaków i pokazuje licznik znaków.
- Zbyt długi tekst blokuje generowanie action pointów i informuje o limicie.

### US-005 Generowanie action pointów przez AI
ID: US-005
Tytuł: Generowanie action pointów przez AI
Opis: Jako menedżer chcę, aby AI generowała action pointy ze wklejonej transkrypcji.
Kryteria akceptacji:
- Po uruchomieniu procesu widoczny jest infinity spinner.
- Po zakończeniu lista action pointów jest zaktualizowana o nowe zadania z niezaznaczonym checkboxem.
- Operacja kończy się w czasie nie dłuższym niż 10 minut w co najmniej 95 procentach przypadków testowych.

### US-006 Regeneracja wniosków AI
ID: US-006
Tytuł: Regeneracja wniosków AI
Opis: Jako menedżer chcę ponownie wygenerować action pointy, jeśli wynik jest niekompletny.
Kryteria akceptacji:
- Dostępny jest przycisk Generuj ponownie po zakończonym pierwszym przetwarzaniu.
- Regeneracja nadpisuje wszystkie ostatnie propozycje AI, łącznie z ręcznymi edycjami.

### US-007 Ręczne zarządzanie action pointami
ID: US-007
Tytuł: Ręczne zarządzanie action pointami
Opis: Jako menedżer chcę edytować, dodawać i usuwać action pointy, aby zachować pełną kontrolę.
Kryteria akceptacji:
- Użytkownik może dodawać własne action pointy z ustawieniem statusu.
- Edycja treści zapisuje się natychmiast i jest widoczna bez potrzeby odświeżenia strony.
- Usunięcie action pointa wymaga potwierdzenia i jest nieodwracalne.

### US-008 Historia spotkań w wątku
ID: US-008
Tytuł: Historia spotkań w wątku
Opis: Jako menedżer chcę przeglądać historię spotkań i action pointów, aby mieć pełny kontekst.
Kryteria akceptacji:
- Historia wyświetla rozwijalne sekcje z datą jako tytuł.
- W każdej sekcji widoczne są action pointy z aktualnym statusem i źródłem (AI lub manualne).
- Tytuł sekcji wyświetla liczbę action pointów w sekcji oraz liczbę action pointów z niezaznaczonym checkboxem.

### US-009 Obsługa błędów AI
ID: US-009
Tytuł: Obsługa błędów AI
Opis: Jako menedżer chcę zostać poinformowany o błędzie AI bez utraty transkrypcji.
Kryteria akceptacji:
- W przypadku błędu pojawia się komunikat z radą kolejnych kroków.
- Transkrypcja i ostatnia lista action pointów pozostają bez zmian.
- Użytkownik ma możliwość ponowienia próby po usunięciu przyczyny błędu.

### US-010 Trwałość danych lokalnych
ID: US-010
Tytuł: Trwałość danych lokalnych
Opis: Jako menedżer chcę, aby moje dane były dostępne po ponownym zalogowaniu.
Kryteria akceptacji:
- Wszystkie dane są zachowywane w lokalnej bazie danych i dostępne po ponownym uruchomieniu aplikacji.

## 6. Metryki sukcesu
1. Co najmniej 80 procent action pointów generowanych lub aktualizowanych przez AI nie wymaga edycji, mierzone ręczną weryfikacją użytkownika po każdym spotkaniu.
2. Użytkownik potrafi utrzymać aktualność statusów w minimum 10 aktywnych wątkach jednocześnie, potwierdzone w badaniu pilotażowym.
3. Średni czas oczekiwania na wynik AI nie przekracza 10 minut, monitorowany logami systemowymi.
4. Co najmniej 70 procent użytkowników pilota deklaruje skrócenie czasu przygotowania follow-upów o 30 procent, mierzone ankietą po okresie testowym.
5. Wdrożony zostaje scenariusz testu end-to-end oraz sesja pilota z menedżerem w MS Teams przed terminem MVP.
