# 🚀 Quick Start - E2E Tests

## Szybki start dla testów E2E

### 1. Instalacja

```bash
# Zainstaluj zależności
npm install

# Zainstaluj przeglądarkę Chromium dla Playwright
npx playwright install chromium
```

### 2. Uruchomienie aplikacji

W osobnym terminalu uruchom serwer deweloperski:

```bash
npm run dev
```

Aplikacja powinna być dostępna pod adresem: `http://localhost:4321`

### 3. Uruchomienie testów

#### Główny test scenariusza użytkownika

```bash
# Uruchom test complete-user-flow.spec.ts
npx playwright test e2e/complete-user-flow.spec.ts
```

#### Wszystkie testy

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e
```

#### Tryb interaktywny (UI Mode)

```bash
# Otwórz interfejs graficzny Playwright
npm run test:e2e:ui
```

#### Tryb headed (widoczna przeglądarka)

```bash
# Zobacz testy w akcji
npm run test:e2e:headed
```

#### Debugowanie

```bash
# Debuguj testy krok po kroku
npm run test:e2e:debug
```

### 4. Raport z testów

Po uruchomieniu testów, wygeneruj raport HTML:

```bash
npm run test:e2e:report
```

## 📋 Scenariusz testowy

Test `complete-user-flow.spec.ts` wykonuje następujące kroki:

1. ✅ **Logowanie** - zaloguj się jako `qubatron15@gmail.com`
2. ✅ **Tworzenie wątku** - dodaj nowy thread z nazwą zawierającą aktualną datę i godzinę
3. ✅ **Dodawanie Action Point** - utwórz AP z nazwą zawierającą aktualną datę i godzinę
4. ✅ **Weryfikacja** - sprawdź, czy AP został poprawnie utworzony
5. ✅ **Wylogowanie** - wyloguj się z aplikacji

## 🔧 Konfiguracja

Dane logowania są zdefiniowane w pliku `e2e/config/test-config.ts`:

```typescript
credentials: {
  email: "qubatron15@gmail.com",
  password: "sajgonki",
}
```

## 📊 Dodatkowe testy

Plik zawiera również testy dla:

- ✅ Persystencja danych po ponownym logowaniu
- ✅ Obsługa nieprawidłowych danych logowania
- ✅ Walidacja długości nazwy wątku (max 20 znaków)
- ✅ Walidacja wymaganego tytułu Action Point

## 🐛 Rozwiązywanie problemów

### Test nie może się zalogować

- Sprawdź, czy aplikacja działa na `http://localhost:4321`
- Sprawdź, czy dane logowania są poprawne
- Sprawdź, czy Supabase jest skonfigurowany

### Test timeout

- Zwiększ timeout w `playwright.config.ts`
- Sprawdź, czy aplikacja odpowiada szybko
- Uruchom test w trybie headed, aby zobaczyć, co się dzieje

### Przeglądarka się nie otwiera

```bash
# Przeinstaluj Chromium
npx playwright install --force chromium
```

## 📚 Więcej informacji

Zobacz pełną dokumentację w pliku `e2e/README.md`
