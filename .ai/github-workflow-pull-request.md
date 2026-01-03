# GitHub Workflow: Pull Request CI

## Przegląd

Workflow `pull-request.yml` automatycznie uruchamia się przy każdym Pull Requestie do gałęzi `main` i wykonuje następujące kroki:

1. **Lintowanie kodu** - sprawdzenie jakości kodu za pomocą ESLint
2. **Testy E2E** - uruchomienie testów end-to-end w Playwright
3. **Status Comment** - dodanie komentarza do PR z podsumowaniem statusu

## Struktura Workflow

### Job 1: Lint Code
- **Czas wykonania**: ~10 minut
- **Działanie**: 
  - Checkout kodu
  - Instalacja Node.js (wersja z `.nvmrc`: 22.14.0)
  - Instalacja zależności (`npm ci`)
  - Uruchomienie ESLint (`npm run lint`)

### Job 2: E2E Tests
- **Czas wykonania**: ~30 minut
- **Zależności**: Wymaga sukcesu Job 1 (lint)
- **Środowisko**: `integration`
- **Zmienne środowiskowe** (z GitHub Secrets):
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `OPENROUTER_API_KEY`
  - `OPENAI_API_KEY`
  - `BASE_URL` (http://localhost:3000)
- **Działanie**:
  - Checkout kodu
  - Instalacja Node.js
  - Instalacja zależności
  - Instalacja przeglądarki Chromium dla Playwright
  - Build aplikacji (`npm run build`)
  - Uruchomienie testów E2E (`npm run test:e2e`)
  - Upload raportów Playwright (zawsze, nawet przy błędach)
  - Upload wyników testów (zawsze, nawet przy błędach)

### Job 3: Status Comment
- **Czas wykonania**: ~5 minut
- **Zależności**: Wymaga zakończenia Job 1 i Job 2 (nawet jeśli failed)
- **Uprawnienia**: `pull-requests: write`
- **Działanie**:
  - Sprawdzenie statusów poprzednich jobów
  - Utworzenie/aktualizacja komentarza w PR z tabelą statusów
  - Komentarz zawiera:
    - Status lintowania (✅/❌)
    - Status testów E2E (✅/❌)
    - Ogólny status workflow
    - Hash commita

## Kluczowe Funkcje

### 1. Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```
Anuluje poprzednie uruchomienia workflow dla tego samego PR, oszczędzając zasoby CI/CD.

### 2. Sekwencyjne Wykonanie
- **lint** → **e2e-test** → **status-comment**
- E2E testy uruchamiają się tylko gdy lintowanie przejdzie pomyślnie
- Status comment uruchamia się zawsze (`if: always()`), niezależnie od wyników poprzednich jobów

### 3. Artefakty
Workflow zapisuje następujące artefakty (dostępne przez 30 dni):
- `playwright-report` - HTML raport z Playwright
- `playwright-results` - Surowe wyniki testów, screenshoty, wideo

### 4. Inteligentny Status Comment
- Znajduje i aktualizuje istniejący komentarz (zamiast tworzyć nowe)
- Wyświetla czytelną tabelę ze statusami
- Używa emoji dla lepszej wizualizacji
- Zawiera hash commita dla łatwego odniesienia

## Użyte GitHub Actions

Wszystkie akcje używają najnowszych stabilnych wersji (major version):

| Akcja | Wersja | Status |
|-------|--------|--------|
| `actions/checkout` | v6 | ✅ Aktywna |
| `actions/setup-node` | v6 | ✅ Aktywna |
| `actions/upload-artifact` | v6 | ✅ Aktywna |
| `actions/github-script` | v8 | ✅ Aktywna |

## Wymagane Sekrety GitHub

Należy skonfigurować następujące sekrety w ustawieniach repozytorium:

### Environment: `integration`
- `SUPABASE_URL` - URL instancji Supabase
- `SUPABASE_KEY` - Klucz API Supabase
- `OPENROUTER_API_KEY` - Klucz API OpenRouter
- `OPENAI_API_KEY` - Klucz API OpenAI

## Konfiguracja Playwright

Workflow instaluje tylko przeglądarkę **Chromium** zgodnie z konfiguracją w `playwright.config.ts`:

```bash
npx playwright install --with-deps chromium
```

## Best Practices Zastosowane

✅ Użycie `npm ci` zamiast `npm install` dla deterministycznych instalacji  
✅ Cache dla zależności Node.js (`cache: 'npm'`)  
✅ Wersja Node.js z pliku `.nvmrc` dla spójności środowisk  
✅ Timeouty dla każdego joba zapobiegające zawieszeniu  
✅ Zmienne środowiskowe na poziomie joba, nie globalnie  
✅ Upload artefaktów nawet przy błędach (`if: always()`)  
✅ Concurrency control dla oszczędności zasobów  
✅ Sekwencyjne wykonanie jobów z zależnościami  
✅ Najnowsze wersje GitHub Actions  
✅ Weryfikacja, że akcje nie są zarchiwizowane  

## Przykładowy Komentarz w PR

```markdown
## ✅ Status CI dla Pull Request

| Job | Status |
|-----|--------|
| Lintowanie | ✅ success |
| Testy E2E | ✅ success |

**Ogólny status:** ✅ success

🎉 Wszystkie sprawdzenia przeszły pomyślnie! Pull request jest gotowy do review.

---
*Workflow uruchomiony dla commita: a1b2c3d*
```

## Troubleshooting

### Problem: E2E testy nie uruchamiają się
**Rozwiązanie**: Sprawdź czy lintowanie przeszło pomyślnie. E2E testy wymagają sukcesu joba `lint`.

### Problem: Brak komentarza w PR
**Rozwiązanie**: Sprawdź czy workflow ma uprawnienia `pull-requests: write` w ustawieniach repozytorium.

### Problem: Błąd "Environment not found"
**Rozwiązanie**: Utwórz environment `integration` w ustawieniach repozytorium i dodaj wymagane sekrety.

### Problem: Playwright nie może zainstalować przeglądarki
**Rozwiązanie**: Workflow używa `--with-deps` który instaluje systemowe zależności. Jeśli problem występuje, sprawdź logi instalacji.

## Następne Kroki

Po skonfigurowaniu tego workflow, rozważ dodanie:

1. **Unit Tests Job** - dodanie testów jednostkowych z coverage
2. **Security Scanning** - OWASP ZAP lub podobne narzędzie
3. **Performance Tests** - k6 dla testów obciążeniowych
4. **Visual Regression** - porównywanie screenshotów
5. **Deployment Preview** - automatyczne wdrożenie preview dla PR

## Zgodność z Wymaganiami

✅ Lintowanie kodu przed testami  
✅ Testy E2E z Playwright  
✅ Status comment tylko gdy poprzednie joby się zakończą  
✅ Pobieranie przeglądarek zgodnie z `playwright.config.ts`  
✅ Środowisko `integration` z sekretami z `.env.example`  
✅ Użycie `npm ci` dla instalacji zależności  
✅ Zmienne środowiskowe na poziomie joba  
✅ Najnowsze wersje GitHub Actions
