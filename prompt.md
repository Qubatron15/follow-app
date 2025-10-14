Chcę, abyś przygotował i zrealizował **Proof of Concept** aplikacji webowej `FollowApp`, która w minimalnym zakresie demonstruje kluczową funkcjonalność MVP: generowanie action pointów z wklejonych transkrypcji spotkań przy użyciu modeli OpenAI (automatyczne wykrywanie PL/EN). Zanim rozpoczniesz implementację, wykonaj plan prac i poczekaj na moją akceptację.

### Założenia projektowe
- **Cel PoC:** Zweryfikować, że po wklejeniu transkrypcji można otrzymać sensowną listę action pointów wygenerowaną przez AI, którą użytkownik może edytować i zapisać lokalnie.
- **Zakres funkcjonalny:** wyłącznie to, co niezbędne do powyższego celu.
  - Tworzenie pojedynczego wątku i przypięcie do niego transkrypcji (bez przełączania zakładek, historii, usuwania itd.).
  - Pole wklejenia transkrypcji (limit znaków, licznik).
  - Przycisk „Generuj action pointy” wywołujący API OpenAI; obsługa błędu oraz prosty stan ładowania.
  - Lista action pointów (tytuł + checkbox) z możliwością edycji tytułu i zmiany statusu; zapis danych lokalnie (Supabase lub fallback do localStorage jeżeli szybciej).
  - Brak historii spotkań, brak regeneracji, brak dodatkowych filtrów, brak integracji z zewnętrznymi narzędziami, brak ekranu logowania, brak kont użytkowników.
- **Technologie:** Astro 5 + React 19 + TypeScript 5 + Tailwind 4 + shadcn/ui na froncie; Supabase (tylko jeśli niezbędne, preferuj zamockowane dane) jako backend-as-a-service; OpenAI API do generowania action pointów; CI/CD pomiń w PoC.
- **Ograniczenia:** aplikacja desktopowa (>=1280 px), brak mobilki, brak powiadomień, brak współdzielenia kont, brak eksportów, brak ekranu logowania.

### Kolejne kroki, które musisz wykonać
1. Przygotuj szczegółowy plan implementacji (sekcje: komponenty UI, integracje backendowe/AI, zarządzanie stanem/danymi, ścieżka testowa E2E).
2. Wylistuj zadania w kolejności realizacji, wskazując co jest absolutnie konieczne dla PoC.
3. Poproś mnie o akceptację planu przed rozpoczęciem implementacji.
4. Po otrzymaniu akceptacji zrealizuj PoC zgodnie z planem i dostarcz krótkie instrukcje uruchomienia wraz z przykładową transkrypcją testową.

Upewnij się, że w żadnym momencie nie rozszerzasz funkcjonalności poza opisany minimalny zakres. Plan i implementacja muszą pozostać maksymalnie odchudzone i skupione na generowaniu action pointów.