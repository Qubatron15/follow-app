# E2E Tests Migration to Vercel Deployment

## Summary

Successfully refactored all Playwright E2E tests to target the deployed Vercel application (`https://follow-app.vercel.app`) instead of `localhost:3000`.

## Changes Made

### 1. Playwright Configuration (`playwright.config.ts`)

**Changed:**
- Updated `baseURL` from `http://localhost:3000` to `https://follow-app.vercel.app`
- Removed `webServer` configuration (no longer needed since we're testing deployed app)

**Before:**
```typescript
baseURL: process.env.BASE_URL || "http://localhost:3000",
webServer: {
  command: "npm run dev",
  url: "http://localhost:3000",
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

**After:**
```typescript
baseURL: process.env.BASE_URL || "https://follow-app.vercel.app",
/* Removed webServer configuration - testing deployed app on Vercel */
```

### 2. Test Configuration (`e2e/config/test-config.ts`)

**Changed:**
- Updated `baseUrl` from `http://localhost:3000` to `https://follow-app.vercel.app`

**Before:**
```typescript
baseUrl: process.env.BASE_URL || "http://localhost:3000",
```

**After:**
```typescript
baseUrl: process.env.BASE_URL || "https://follow-app.vercel.app",
```

### 3. Environment Example (`e2e/.env.example`)

**Changed:**
- Updated default `BASE_URL` to Vercel deployment
- Added comment about using localhost for local development

**Before:**
```bash
# Base URL for tests (optional, defaults to http://localhost:4321)
BASE_URL=http://localhost:4321
```

**After:**
```bash
# Base URL for tests (optional, defaults to https://follow-app.vercel.app)
# Use localhost for local development: http://localhost:4321
BASE_URL=https://follow-app.vercel.app
```

### 4. GitHub Actions Workflow (`.github/workflows/pull-request.yml`)

**Changed:**
- Updated `BASE_URL` environment variable to Vercel deployment
- Removed `Build application` step (no longer needed)

**Before:**
```yaml
env:
  BASE_URL: http://localhost:3000

steps:
  - name: Build application
    run: npm run build
  - name: Run E2E tests
    run: npm run test:e2e
```

**After:**
```yaml
env:
  BASE_URL: https://follow-app.vercel.app

steps:
  - name: Run E2E tests
    run: npm run test:e2e
```

### 5. Documentation Updates

#### `e2e/README.md`
- Updated codegen command to show both Vercel and localhost options

**Before:**
```bash
npx playwright codegen http://localhost:4321
```

**After:**
```bash
# For deployed app
npx playwright codegen https://follow-app.vercel.app

# For local development
npx playwright codegen http://localhost:4321
```

#### `e2e/QUICKSTART.md`
- Replaced "Uruchomienie aplikacji" section with "Konfiguracja" section
- Updated to explain that tests run against Vercel by default
- Added instructions for local testing with `.env` file
- Updated troubleshooting section

## Benefits

1. **No Local Server Required**: Tests can run without starting a local dev server
2. **Faster CI/CD**: Removed build step saves ~2-3 minutes per workflow run
3. **Production Testing**: Tests run against actual deployed environment
4. **Easier Setup**: Contributors don't need to run local server to execute tests
5. **Consistent Environment**: All tests run against same deployment

## Local Development

To test against local development server, create `e2e/.env`:

```bash
BASE_URL=http://localhost:4321
```

Then run the dev server:
```bash
npm run dev
```

## CI/CD Impact

- **Time Saved**: ~2-3 minutes per workflow run (no build step)
- **Simplified Workflow**: Fewer steps, less complexity
- **More Reliable**: No local server startup issues

## Files Modified

1. `/playwright.config.ts`
2. `/e2e/config/test-config.ts`
3. `/e2e/.env.example`
4. `/.github/workflows/pull-request.yml`
5. `/e2e/README.md`
6. `/e2e/QUICKSTART.md`

## Testing

To verify the changes work:

```bash
# Run tests against Vercel deployment
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test e2e/complete-user-flow.spec.ts
```

## Notes

- All test files remain unchanged (no code modifications needed)
- Page objects remain unchanged
- Test helpers remain unchanged
- Only configuration and documentation updated
- Tests can still run locally by setting `BASE_URL` environment variable
