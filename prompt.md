Jesteś doświadczonym menedżerem produktu, którego zadaniem jest stworzenie kompleksowego dokumentu wymagań produktu (PRD) w oparciu o poniższe opisy:

<project_description>
# Aplikacja - FollowApp (MVP)

### Główny problem
Managerowie korporacyjni tracą kontrolę nad licznymi wątkami projektowymi i action pointami wynikającymi z wielu spotkań. Ręczne śledzenie statusów zadań i aktualizowanie list jest czasochłonne i prowadzi do chaosu informacyjnego.

### Najmniejszy zestaw funkcjonalności
- Możliwość definiowania wątków tematycznych
- Wklejanie transkrypcji spotkań przypisanych do konkretnego wątku
- Automatyczne przetwarzanie transkrypcji przez AI w celu:
  - aktualizacji statusów istniejących action pointów (wykonane, zaniechane, w toku)
  - generowania nowych action pointów z treści spotkania
- Historia spotkań oraz action pointów w ramach wątku
- Prosty panel użytkownika do przeglądania aktualnego stanu realizacji

### Co NIE wchodzi w zakres MVP
- Integracja z kalendarzami, komunikatorami (Teams, Slack) i systemami task managementu (Jira, Asana)
- Analiza emocji lub tonu rozmów w transkrypcji
- Wersje mobilne aplikacji
- System powiadomień i przypomnień
- Współdzielone wątki i role zespołowe

### Kryteria sukcesu
- Użytkownicy są w stanie utrzymać pełną aktualność statusów w minimum 10 wątkach równocześnie
- Action pointy są automatycznie aktualizowane po każdym spotkaniu w 80% przypadków  
- Historia wątków i spotkań jest przejrzysta i łatwa do przeglądania  
- Użytkownicy deklarują oszczędność czasu podczas planowania i follow-upów
</project_description>

<project_details>
<conversation_summary>
<decisions>
1. `FollowApp` obsługuje zalogowanego użytkownika z własnymi wątkami, logowanie jest wymagane.
2. Wątki prezentowane są jako zakładki; pusty stan pokazuje ekran z przyciskiem `Nowy wątek`.
3. Nazwa wątku musi być niepusta i mieć maks. 20 znaków.
4. Transkrypcje są wklejane ręcznie (do 30 000 znaków) i przetwarzane po kliknięciu `Generuj Action Pointy`; dostępny jest przycisk `Generuj ponownie`.
5. Action pointy można edytować, usuwać i dodawać; brak możliwości przywracania usuniętych pozycji.
6. LLM OpenAI automatycznie rozpoznaje język (PL/EN); oczekiwany czas generowania/regeneracji ≤10 minut.
7. Błąd AI wyświetla komunikat i pozostawia transkrypcję nietkniętą.
8. Historia spotkań prezentuje datę dodania transkrypcji (brak dodatkowych metadanych).
9. Dane przechowywane są w lokalnej bazie; brak wymagań RODO/logów zmian.
10. MVP realizuje pojedynczy developer (przy wsparciu AI) z terminem na połowę grudnia; planowane testy z jednym managerem w MS Teams plus jeden scenariusz e2e.
</decisions>

<matched_recommendations>
1. Wdrożenie onboardingowego ekranu pustego stanu (`Nowy wątek`) zgodnie z rekomendacją dotyczącą jasnego startu użytkownika.
2. Precyzyjne zasady nazewnictwa wątków (limit długości, unikalność) wynikające z wcześniejszej rekomendacji.
3. Określenie przechowywania danych w lokalnej bazie zgodnie z zaleceniem doprecyzowania architektury storage’u.
4. Użycie OpenAI LLM i automatycznego rozpoznawania języka jako odpowiedź na rekomendację wyboru technologii AI i sposobu detekcji języka.
5. Zdefiniowanie obsługi błędów AI bez utraty transkrypcji zgodnie z wcześniejszą rekomendacją fallbacków i komunikatów.
6. Zaplanowanie testu z managerem i scenariusza e2e w odpowiedzi na rekomendację przygotowania planu testów beta.
</matched_recommendations>

<prd_planning_summary>
- **Główne wymagania funkcjonalne**: logowanie jednego użytkownika; tworzenie wątków jako zakładek (nazwa ≤20 znaków); wklejanie transkrypcji do 30 000 znaków; generowanie/regeneracja action pointów przez LLM OpenAI z automatycznym rozpoznaniem języka; lista action pointów z możliwością edycji, usuwania, dodawania oraz oznaczania wykonania; historia spotkań jako rowijalne sekcje z datą wklejenia w tytule;action pointy jako podeementy rozwijalnych sekcji; obsługa błędów AI z komunikatem i zachowaniem danych; przechowywanie wszystkiego w lokalnej bazie.
- **Kluczowe historie użytkownika / ścieżki**: użytkownik loguje się; widzi pusty ekran i tworzy nowy wątek; przełącza się między zakładkami wątków; wkleja transkrypcję i uruchamia generowanie action pointów; w razie potrzeby ponawia generowanie; edytuje, usuwa lub dodaje własne action pointy; przegląda historię spotkań w wątku; otrzymuje komunikat o błędzie bez utraty danych.
- **Kryteria sukcesu i pomiar**: AI utrzymuje ≥80 % nieusuniętych action pointów (przez ręczną weryfikację użytkownika); użytkownicy oznaczają wykonane zadania; historia spotkań jest przejrzysta dzięki rozwijalnym sekcjom z datami; testy z managerem w MS Teams oraz scenariusz e2e zapewniają walidację MVP przed terminem. Dodatkowo KPI czasowe obejmują maksymalnie 10 minut oczekiwania na wyniki AI.
- **Harmonogram i zasoby**: jednoosobowy zespół developerski ze wsparciem AI, deadline w połowie grudnia; planowane testy końcowe z managerem i automatyczne e2e dla jednego scenariusza.
</prd_planning_summary>

<unresolved_issues>
Brak.
</unresolved_issues>
</conversation_summary>
</project_details>

Wykonaj następujące kroki, aby stworzyć kompleksowy i dobrze zorganizowany dokument:

1. Podziel PRD na następujące sekcje:
   a. Przegląd projektu
   b. Problem użytkownika
   c. Wymagania funkcjonalne
   d. Granice projektu
   e. Historie użytkownika
   f. Metryki sukcesu

2. W każdej sekcji należy podać szczegółowe i istotne informacje w oparciu o opis projektu i odpowiedzi na pytania wyjaśniające. Upewnij się, że:
   - Używasz jasnego i zwięzłego języka
   - W razie potrzeby podajesz konkretne szczegóły i dane
   - Zachowujesz spójność w całym dokumencie
   - Odnosisz się do wszystkich punktów wymienionych w każdej sekcji

3. Podczas tworzenia historyjek użytkownika i kryteriów akceptacji
   - Wymień WSZYSTKIE niezbędne historyjki użytkownika, w tym scenariusze podstawowe, alternatywne i skrajne.
   - Przypisz unikalny identyfikator wymagań (np. US-001) do każdej historyjki użytkownika w celu bezpośredniej identyfikowalności.
   - Uwzględnij co najmniej jedną historię użytkownika specjalnie dla bezpiecznego dostępu lub uwierzytelniania, jeśli aplikacja wymaga identyfikacji użytkownika lub ograniczeń dostępu.
   - Upewnij się, że żadna potencjalna interakcja użytkownika nie została pominięta.
   - Upewnij się, że każda historia użytkownika jest testowalna.

Użyj następującej struktury dla każdej historii użytkownika:
- ID
- Tytuł
- Opis
- Kryteria akceptacji

4. Po ukończeniu PRD przejrzyj go pod kątem tej listy kontrolnej:
   - Czy każdą historię użytkownika można przetestować?
   - Czy kryteria akceptacji są jasne i konkretne?
   - Czy mamy wystarczająco dużo historyjek użytkownika, aby zbudować w pełni funkcjonalną aplikację?
   - Czy uwzględniliśmy wymagania dotyczące uwierzytelniania i autoryzacji (jeśli dotyczy)?

5. Formatowanie PRD:
   - Zachowaj spójne formatowanie i numerację.
   - Nie używaj pogrubionego formatowania w markdown ( ** ).
   - Wymień WSZYSTKIE historyjki użytkownika.
   - Sformatuj PRD w poprawnym markdown.

Przygotuj PRD z następującą strukturą:

```markdown
# Dokument wymagań produktu (PRD) - {{app-name}}
## 1. Przegląd produktu
## 2. Problem użytkownika
## 3. Wymagania funkcjonalne
## 4. Granice produktu
## 5. Historyjki użytkowników
## 6. Metryki sukcesu
```

Pamiętaj, aby wypełnić każdą sekcję szczegółowymi, istotnymi informacjami w oparciu o opis projektu i nasze pytania wyjaśniające. Upewnij się, że PRD jest wyczerpujący, jasny i zawiera wszystkie istotne informacje potrzebne do dalszej pracy nad produktem.

Ostateczny wynik powinien składać się wyłącznie z PRD zgodnego ze wskazanym formatem w markdown, który zapiszesz w pliku .ai/prd.md