Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - API OpenAI użyte bezpośrednio:
- Dobrze udokumentowane SDK i łatwość integracji
{{ ... }}
- Natywne wsparcie dla języka polskiego i angielskiego (wymóg PRD)
- Lepsza kontrola nad czasem odpowiedzi (limit 10 minut)
- Bogata baza przykładów implementacji i wsparcie społeczności

Testing - Kompleksowe pokrycie testami:
- Jest + ts-jest do testów jednostkowych i integracyjnych
- Supertest do testowania endpointów HTTP/API
- @testing-library/react + @testing-library/astro do testów komponentów
- Playwright do testów E2E, dostępności (axe-core) i regresji wizualnej
- k6 do testów wydajnościowych i obciążeniowych
- OWASP ZAP do dynamicznej analizy bezpieczeństwa
- eslint-plugin-security do statycznej analizy bezpieczeństwa
- Docker Compose do lokalnego stacku testowego Supabase

CI/CD:
- Github Actions do tworzenia pipeline'ów CI/CD
- Automatyczne uruchamianie pełnego zestawu testów
- Blokada merge przy niepowodzeniu testów
- Pokrycie kodu ≥ 85% dla warstwy logiki biznesowej