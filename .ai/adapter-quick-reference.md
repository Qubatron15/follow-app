# Astro Adapter Quick Reference

## When to Use Which Adapter

### 🎯 Quick Decision Tree

```
Do you need SSR/API routes?
├─ NO → Use output: "static" (no adapter needed)
└─ YES → Where are you deploying?
    ├─ Vercel → @astrojs/vercel/serverless
    ├─ Netlify → @astrojs/netlify
    ├─ Cloudflare → @astrojs/cloudflare
    ├─ AWS → @astrojs/node + AWS Lambda
    ├─ Docker/VPS → @astrojs/node (standalone)
    └─ Other → Check Astro docs
```

---

## Common Adapters Comparison

| Platform | Adapter | Install Command | Config Import |
|----------|---------|----------------|---------------|
| **Vercel** | `@astrojs/vercel` | `npm i @astrojs/vercel` | `import vercel from "@astrojs/vercel/serverless"` |
| **Netlify** | `@astrojs/netlify` | `npm i @astrojs/netlify` | `import netlify from "@astrojs/netlify"` |
| **Cloudflare** | `@astrojs/cloudflare` | `npm i @astrojs/cloudflare` | `import cloudflare from "@astrojs/cloudflare"` |
| **Node.js** | `@astrojs/node` | `npm i @astrojs/node` | `import node from "@astrojs/node"` |
| **Deno** | `@astrojs/deno` | `npm i @astrojs/deno` | `import deno from "@astrojs/deno"` |

---

## Error Patterns and Solutions

### ❌ Error: "Cannot find module '@astrojs/[adapter]'"
**Cause:** Adapter package not installed
**Fix:**
```bash
npm install @astrojs/[adapter]
```

### ❌ Error: "NOT_FOUND" on Vercel
**Cause:** Wrong adapter (probably using Node.js)
**Fix:**
```javascript
// Change from:
import node from "@astrojs/node";
adapter: node({ mode: "standalone" })

// To:
import vercel from "@astrojs/vercel/serverless";
adapter: vercel()
```

### ❌ Error: "Build failed" with serverless adapter
**Cause:** Using Node.js APIs not available in serverless
**Fix:** Check if you're using:
- File system operations (`fs`)
- Long-running processes
- Native modules
→ Consider switching to Node.js standalone

### ❌ Error: "Function size exceeded"
**Cause:** Bundle too large for serverless limits
**Fix:**
1. Check bundle size: `npm run build`
2. Remove unused dependencies
3. Use dynamic imports
4. Consider edge functions or Node.js standalone

---

## Configuration Examples

### Vercel Serverless (Current Setup)
```javascript
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),
});
```

### Vercel Edge (Advanced)
```javascript
import vercel from "@astrojs/vercel/edge";

export default defineConfig({
  output: "server",
  adapter: vercel({
    edgeMiddleware: true,
  }),
});
```

### Node.js Standalone (Docker/VPS)
```javascript
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
```

### Static Site (No SSR)
```javascript
export default defineConfig({
  output: "static", // No adapter needed!
  integrations: [react()],
});
```

### Hybrid (Static + Some SSR)
```javascript
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "hybrid", // Static by default, opt-in to SSR
  adapter: vercel(),
});

// In pages that need SSR:
// export const prerender = false;
```

---

## Platform-Specific Limits

### Vercel Serverless
- **Function size:** 50 MB (compressed)
- **Timeout:** 10s (Hobby), 60s (Pro), 900s (Enterprise)
- **Memory:** 1024 MB (Hobby), 3008 MB (Pro)
- **Regions:** Auto (global)

### Vercel Edge
- **Function size:** 1 MB (compressed)
- **Timeout:** 30s (all plans)
- **Memory:** 128 MB
- **Regions:** Global edge network

### Netlify Functions
- **Function size:** 50 MB (unzipped)
- **Timeout:** 10s (Free), 26s (Pro)
- **Memory:** 1024 MB
- **Regions:** Auto

### Cloudflare Workers
- **Function size:** 1 MB (compressed)
- **Timeout:** No limit (CPU time: 50ms free, 50s paid)
- **Memory:** 128 MB
- **Regions:** Global edge network

---

## Switching Adapters

### From Node.js to Vercel

```bash
# 1. Uninstall old adapter
npm uninstall @astrojs/node

# 2. Install new adapter
npm install @astrojs/vercel

# 3. Update config
# Change import and adapter in astro.config.mjs

# 4. Test build
npm run build

# 5. Deploy
vercel deploy
```

### From Vercel to Node.js

```bash
# 1. Uninstall old adapter
npm uninstall @astrojs/vercel

# 2. Install new adapter
npm install @astrojs/node

# 3. Update config
# Change import and adapter in astro.config.mjs

# 4. Test build
npm run build

# 5. Deploy to your VPS/Docker
# Use dist/server/entry.mjs as entry point
```

---

## Debugging Tips

### Check Build Output

```bash
npm run build
```

**Expected output directories:**

| Adapter | Output Directory | Entry Point |
|---------|-----------------|-------------|
| Vercel | `.vercel/output/` | (Vercel handles) |
| Netlify | `.netlify/` | (Netlify handles) |
| Node.js | `dist/server/` | `entry.mjs` |
| Static | `dist/` | `index.html` |

### Verify Adapter is Working

1. **Check package.json:**
   ```bash
   npm list | grep astrojs
   ```
   Should show your adapter package

2. **Check build output:**
   ```bash
   npm run build && ls -la .vercel/output/
   ```
   Should show `config.json`, `static/`, `functions/`

3. **Test locally:**
   ```bash
   npm run preview
   ```
   Should work on localhost

### Common Gotchas

1. **Forgot to install adapter:** Build fails with import error
2. **Wrong adapter for platform:** Deployment succeeds but routes 404
3. **Mixed adapters:** Only one adapter can be active at a time
4. **Static output with adapter:** Adapter is ignored, builds static site
5. **Missing `output: "server"`:** Adapter is ignored, builds static site

---

## Environment Variables

### Vercel
Set in Vercel Dashboard → Settings → Environment Variables
- Automatically injected at runtime
- Use `import.meta.env.VARIABLE_NAME`

### Node.js Standalone
Set in `.env` file or system environment
- Load with `dotenv` or system vars
- Use `import.meta.env.VARIABLE_NAME`

### Edge Functions (Vercel/Cloudflare)
- Limited environment variable support
- No access to process.env in some cases
- Use platform-specific APIs

---

## Performance Comparison

| Metric | Static | Serverless | Edge | Node.js |
|--------|--------|------------|------|---------|
| **First Load** | ⚡ Fastest | 🟡 Cold start | ⚡ Fast | ✅ Fast |
| **Subsequent** | ⚡ Fastest | ⚡ Fast | ⚡ Fastest | ✅ Fast |
| **Scaling** | ⚡ Infinite | ⚡ Auto | ⚡ Auto | 🟡 Manual |
| **Cost** | ⚡ Cheapest | 🟡 Variable | 🟡 Variable | ✅ Fixed |
| **Complexity** | ⚡ Simplest | ✅ Simple | 🟡 Medium | 🟡 Medium |

---

## When to Reconsider Your Adapter

### Switch FROM Serverless TO Node.js if:
- ❌ Hitting function size limits (>50 MB)
- ❌ Hitting timeout limits (>10s execution)
- ❌ Need file system access
- ❌ Need long-running processes
- ❌ Costs are too high

### Switch FROM Node.js TO Serverless if:
- ❌ Struggling with scaling
- ❌ High server costs
- ❌ Want zero DevOps
- ❌ Need global distribution
- ❌ Traffic is unpredictable

### Switch FROM Serverless TO Static if:
- ❌ Don't actually need SSR
- ❌ Content rarely changes
- ❌ Want maximum performance
- ❌ Want minimum cost

---

## Resources

- [Astro Adapters Docs](https://docs.astro.build/en/guides/deploy/)
- [Vercel Astro Guide](https://vercel.com/docs/frameworks/astro)
- [Netlify Astro Guide](https://docs.netlify.com/integrations/frameworks/astro/)
- [Cloudflare Astro Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)

---

**Last Updated:** 2026-01-03
**Your Current Setup:** Vercel Serverless ✅
