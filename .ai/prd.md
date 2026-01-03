# Dokument wymagań produktu (PRD) - FollowApp

## 1. Przegląd produktu
FollowApp to lekka aplikacja webowa dla managerów korporacyjnych, która automatyzuje śledzenie action pointów (AP) wynikających ze spotkań. Użytkownik tworzy wątki tematyczne jako zakładki, wkleja transkrypcje spotkań i jednym kliknięciem generuje lub aktualizuje listę AP przy pomocy modelu językowego OpenAI. Aplikacja przechowuje wszystkie dane w bazie oraz wymaga zalogowania użytkownika (uwierzytelnianie) do przedefiniowanego konta. Jej minimalny zestaw funkcjonalny pozwala zachować pełną aktualność statusów w min. 10 równoległych wątkach.

## 2. Problem użytkownika
• Managerowie prowadzą liczne projekty, co wymusza uczestnictwo w wielu spotkaniach i generuje dziesiątki zadań do śledzenia.
• Ręczne kopiowanie transkrypcji, wyłuskiwanie z nich zadań i aktualizowanie statusów jest czasochłonne i podatne na błędy.
• Brak jednego, prostego narzędzia utrzymującego wszystkie bieżące action pointy w jednym miejscu skutkuje chaosem informacyjnym oraz opóźnieniami wykonywania zadań.

## 3. Wymagania funkcjonalne
F-01 Możliwość tworzenia wątków tematycznych jako zakładek (nazwa niepusta, do 20 znaków, unikalna w ramach instancji).
F-02 Wyświetlanie wątków w postaci przełączalnych zakładek; pusty stan pokazuje ekran powitalny z przyciskiem „Nowy wątek”.
F-03 Wklejanie transkrypcji (do 30 000 znaków) przypisanych do aktywnego wątku.
F-04 Przyciski „Generuj Action Pointy” i „Generuj ponownie” uruchamiają przetwarzanie AI dla aktywnej transkrypcji.
F-05 AI OpenAI automatycznie rozpoznaje język transkrypcji (PL lub EN) oraz:
     • wyciąga nowe AP i dodaje je do listy.
F-06 Czas generowania lub regeneracji nie przekracza 10 minut; w razie błędu AI wyświetla komunikat i zachowuje transkrypcję bez zmian.
F-07 Użytkownik może edytować treść AP, oznaczać status, usuwać oraz dodawać nowe AP ręcznie; brak opcji przywracania usuniętych pozycji.
F-08 Całość danych (wątki, transkrypcje, AP) przechowywana jest w bazie danych; brak wymagań co do RODO ani rejestrowania logów zmian.
F-09 Aplikacja wymaga kont użytkownika oraz procesu logowania (uwierzytelnianie).

## 4. Granice produktu
G-01 Poza zakresem są integracje z kalendarzami (Outlook, Google Calendar), komunikatorami (Teams, Slack) i systemami zarządzania zadaniami (Jira, Asana).
G-02 Brak analizy emocji lub tonu rozmów w transkrypcji.
G-03 Brak powiadomień push, e-mail czy wewnętrznych przypomnień.
G-04 Brak wersji mobilnej i aplikacji natywnych; MVP to aplikacja desktop-web.
G-05 Brak współdzielenia wątków, ról zespołowych i kontroli uprawnień.
G-06 Brak możliwości przywracania usuniętych AP i historii zmian.

## 5. Historyjki użytkowników
| ID | Tytuł | Opis | Kryteria akceptacji |
|----|-------|------|---------------------|
| US-001 | Utworzenie nowego wątku | Jako manager chcę utworzyć nowy wątek, aby śledzić AP dla danego projektu. | • Po kliknięciu „Nowy wątek” wyświetla się modal z polem nazwy. • Pole nazwy nie przyjmuje pustej wartości i ogranicza długość do 20 znaków. • Po zatwierdzeniu wątek pojawia się jako zakładka z unikalną nazwą. • Tworzenie nowego wątku nie jest dostępne dla niezalogowanych użytkowników. |
| US-002 | Wyświetlenie pustego stanu | Jako nowy użytkownik chcę zobaczyć jasny ekran startowy, aby wiedzieć od czego zacząć. | • Przy braku wątków wyświetla się ekran powitalny z przyciskiem „Nowy wątek”. • Wyświetlenie pustego stanu nie jest dostępne dla niezalogowanych użytkowników. |
| US-003 | Wklejenie transkrypcji | Jako manager chcę wkleić transkrypcję spotkania do wybranego wątku, aby móc wygenerować AP. | • Pole tekstowe przyjmuje maks. 30 000 znaków. • Wklejona transkrypcja jest przypisana wyłącznie do aktywnego wątku. • Wkleianie transkrypcji nie jest dostępne dla niezalogowanych użytkowników. |
| US-004 | Generowanie AP | Jako manager chcę, aby AI wygenerowało AP na podstawie transkrypcji, żebym oszczędził czas. | • Po kliknięciu „Generuj Action Pointy” lista AP aktualizuje się w ≤10 min. • Nowe AP pojawiają się na liście. • Generowanie AP nie jest dostępne dla niezalogowanych użytkowników. |
| US-005 | Edycja AP | Jako manager chcę edytować treść AP, aby doprecyzować zadania. | • Kliknięcie ikonki edycji umożliwia zmianę treści i zapisywanie zmian. • Edycja AP nie jest dostępne dla niezalogowanych użytkowników. |
| US-006 | Usuwanie AP | Jako manager chcę usuwać niepotrzebne AP, aby utrzymać listę aktualną. | • Kliknięcie ikonki kosza usuwa AP i usuwa je trwale bez możliwości cofnięcia. • Usuwanie AP nie jest dostępne dla niezalogowanych użytkowników. |
| US-007 | Dodawanie własnych AP | Jako manager chcę ręcznie dodać AP, których AI nie wykryło, aby lista była kompletna. | • Przycisk „Dodaj AP” otwiera formularz z polem treści i checkboxem default „unchecked”. • Po zapisaniu AP pojawia się na liście. • Dodawanie własnych AP nie jest dostępne dla niezalogowanych użytkowników. |
| US-008 | Oznaczanie statusu AP | Jako manager chcę oznaczać AP jako wykonane lub niewykonane, aby śledzić postęp. | • Lista AP umożliwia zmianę statusu poprzez checkbox. • Oznaczanie statusu AP nie jest dostępne dla niezalogowanych użytkowników. |
| US-009 | Obsługa błędu AI | Jako manager chcę otrzymać czytelny komunikat w razie błędu AI, by wiedzieć co się stało. | • W przypadku błędu AI pojawia się komunikat. • Transkrypcja pozostaje nietknięta, lista AP się nie zmienia. |
| US-010 | Logowanie użytkownika | Jako użytkownik chcę się zalogować do aplikacji, aby uzyskać dostęp do swoich danych i zabezpieczyć dostęp. | • Jeśli użytkownik nie jest zalogowany, aplikacja wyświetla dedykowany ekran logowania z polami „e-mail” i „hasło”. • Po poprawnym uwierzytelnieniu użytkownik uzyskuje dostęp do wszystkich funkcji z PRD (wątki, transkrypcje, action pointy). • W prawym górnym rogu `Layout.astro` widoczny jest przycisk „Wyloguj”, który po użyciu kończy sesję i przenosi na ekran logowania. • Próba otwarcia widoków wymagających uwierzytelnienia bez aktywnej sesji przekierowuje na ekran logowania.




## 6. Metryki sukcesu
M-01 Co najmniej 80 % action pointów wygenerowanych przez AI pozostaje nieusuniętych po ręcznej weryfikacji użytkownika.
M-02 Aplikacja pozostaje responsywna dla ≥10 jednoczesnych wątków, a operacje AI trwają ≤10 min.
M-03 Pomysły na ulepszenia po testach e2e ograniczają się do kosmetycznych usprawnień interfejsu (max. 3 zgłoszenia).
