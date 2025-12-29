



<conversation_summary>
<decisions>
1. `FollowApp` obsługuje konta użytkowników; logowanie (uwierzytelnianie) jest wymagane.
2. Wątki prezentowane są jako zakładki; pusty stan pokazuje ekran z przyciskiem `Nowy wątek`.
3. Nazwa wątku musi być niepusta i mieć maks. 20 znaków.
4. Transkrypcje są wklejane ręcznie (do 30 000 znaków) i przetwarzane po kliknięciu `Generuj Action Pointy`; dostępny jest przycisk `Generuj ponownie`.
5. Action pointy można edytować, usuwać i dodawać; brak możliwości przywracania usuniętych pozycji.
6. LLM OpenAI automatycznie rozpoznaje język (PL/EN); oczekiwany czas generowania/regeneracji ≤10 minut.
7. Błąd AI wyświetla komunikat i pozostawia transkrypcję nietkniętą.
8. Dane przechowywane są w lokalnej bazie; brak wymagań RODO/logów zmian.
9. MVP realizuje pojedynczy developer (przy wsparciu AI) z terminem na połowę grudnia; planowane testy z jednym managerem w MS Teams plus jeden scenariusz e2e.
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
- **Główne wymagania funkcjonalne**: obsługa kont użytkowników i wymóg logowania; tworzenie wątków jako zakładek (nazwa ≤20 znaków); wklejanie transkrypcji do 30 000 znaków; generowanie/regeneracja action pointów przez LLM OpenAI z automatycznym rozpoznaniem języka; lista action pointów z możliwością edycji, usuwania, dodawania oraz oznaczania wykonania; action pointy zeprezentowane jako oddzielne elementy w każdej z zakładek; obsługa błędów AI z komunikatem i zachowaniem danych; przechowywanie wszystkiego w lokalnej bazie.
- **Kluczowe historie użytkownika / ścieżki**: użytkownik widzi pusty ekran i tworzy nowy wątek; przełącza się między zakładkami wątków; wkleja transkrypcję pod daną z zakładek i uruchamia generowanie action pointów; w razie potrzeby ponawia generowanie; edytuje, usuwa lub dodaje własne action pointy; otrzymuje komunikat o błędzie bez utraty danych.
- **Kryteria sukcesu i pomiar**: AI utrzymuje ≥80 % nieusuniętych action pointów (przez ręczną weryfikację użytkownika); użytkownicy oznaczają wykonane zadania; testy z managerem w MS Teams oraz scenariusz e2e zapewniają walidację MVP przed terminem. Dodatkowo KPI czasowe obejmują maksymalnie 10 minut oczekiwania na wyniki AI.
- **Harmonogram i zasoby**: jednoosobowy zespół developerski ze wsparciem AI, deadline w połowie grudnia; planowane testy końcowe z managerem i automatyczne e2e dla jednego scenariusza.
</prd_planning_summary>

<unresolved_issues>
Brak.
</unresolved_issues>
</conversation_summary>