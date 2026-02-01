# Security & Privacy Audit — whatsmydna
Date: 2026-02-01

Scope: source under `src/`, `static/`, and build artifacts under `build/`.

## 1. Privacy Verification
- ✅ PASS — No browser telemetry APIs used for DNA data (fetch/XHR/beacon/WebSocket/postMessage/IndexedDB/sessionStorage).
  Evidence:
  ```
  rg -n "fetch\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|localStorage|sessionStorage|IndexedDB|postMessage" src
  src/lib/stores/app.ts:14:        const stored = localStorage.getItem('theme');
  src/lib/stores/app.ts:35:        localStorage.setItem('lang', lang);
  src/routes/+page.svelte:25:        localStorage.setItem('theme', t);
  src/lib/analysis/comprehensiveAnalyzer.ts:50:  const response = await fetch('/data/clinvar.json');
  src/lib/analysis/comprehensiveAnalyzer.ts:61:  const response = await fetch('/data/pharmgkb.json');
  src/lib/api/client.ts:35:      const response = await fetch(url, {
  src/routes/api/analyze/+server.ts:40:      const mvResponse = await fetch(MYVARIANT_URL, {
  ```
  LocalStorage usage is only `theme` and `lang` preferences, not DNA data:
  ```
  src/lib/stores/app.ts:13-41
  localStorage.getItem('theme')
  localStorage.setItem('lang', lang)
  ```

- ✅ PASS — No analytics/tracking scripts detected.
  Evidence:
  ```
  rg -n "analytics|gtag|ga\(|google-analytics|plausible|segment|mixpanel|sentry|logrocket|amplitude|hotjar|fullstory|clarity|fathom" src static build
  # (no matches)
  ```

- ❌ FAIL — External endpoints exist in codebase (potential for DNA-derived data egress if wired in).
  Evidence:
  ```
  src/lib/api/client.ts
  fetchWithRetry('https://myvariant.info/v1/variant', ...)
  fetchWithRetry('https://rest.ensembl.org/variation/human', ...)
  fetchWithRetry('https://www.ebi.ac.uk/gwas/rest/api/...', ...)

  src/routes/api/analyze/+server.ts
  const MYVARIANT_URL = 'https://myvariant.info/v1/variant'
  const ENSEMBL_URL = 'https://rest.ensembl.org/variation/human'
  ```
  Note: These are not referenced from UI, but present and allowed by CSP; they could be used to transmit rsids (DNA-derived data) if enabled later.

## 2. Data Flow Audit
- ✅ PASS — DNA file content stays in memory only during analysis; no persistence.
  Evidence:
  ```
  src/routes/+page.svelte
  const content = await file.text();
  const results = await analyzeGenomeComprehensive(content, ...)
  analysisState.set({ status: 'complete', results });
  ```
  No writes to storage beyond theme/lang preferences.

- ✅ PASS — DropZone passes file directly to handler (no storage).
  Evidence:
  ```
  src/lib/components/DropZone.svelte
  dispatch('file', files[0]);
  ```

- ❌ FAIL — “Destroy” only clears state, but does not actively overwrite sensitive buffers.
  Evidence:
  ```
  src/routes/+page.svelte
  function destroyData() {
    analysisState.set({ status: 'idle' });
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }
  ```
  The original `content` string and parsed data remain in memory until GC; there is no explicit zeroization/overwrite.

## 3. Network Analysis
- ✅ PASS — Client fetches only same-origin static databases for main analysis.
  Evidence:
  ```
  src/lib/analysis/comprehensiveAnalyzer.ts
  fetch('/data/clinvar.json')
  fetch('/data/pharmgkb.json')
  ```

- ❌ FAIL — External network endpoints are present (CSP permits them) and could be used to transmit DNA-derived identifiers.
  Evidence:
  ```
  src/hooks.server.ts
  connect-src 'self' https://myvariant.info https://rest.ensembl.org https://www.ebi.ac.uk;

  src/routes/api/analyze/+server.ts
  fetch(MYVARIANT_URL, ...)
  fetch(ENSEMBL_URL, ...)
  ```

- ✅ PASS — No client-side CORS risk for primary workflow (same-origin `/data/*.json`).
  Evidence: static fetches are relative and same-origin.

## 4. Build Output Check
- ✅ PASS — No hardcoded secrets/keys found in `build/` (matches are generic/minified token strings only).
  Evidence:
  ```
  rg -n -i "(api_key|apikey|secret|token|client_secret|authorization|bearer|password)" build -m 20
  # only minified bundle matches; no key-like literals observed
  ```

- ✅ PASS — No source maps found in `build/`.
  Evidence:
  ```
  find build -type f -name "*.map" -o -name "*.js.map"
  # (no files)
  ```

- ✅ PASS — CSP headers set in `src/hooks.server.ts`.
  Evidence:
  ```
  src/hooks.server.ts
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://myvariant.info https://rest.ensembl.org https://www.ebi.ac.uk;
  frame-ancestors 'none';
  ```

## 5. Input Validation
- ✅ PASS — File size and line-count caps are enforced before parsing.
  Evidence:
  ```
  src/lib/analysis/parser.ts
  MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
  MAX_LINE_COUNT = 2_000_000
  if (fileSize > MAX_FILE_SIZE_BYTES) throw new Error(...)
  if (lineCount > MAX_LINE_COUNT) throw new Error(...)
  ```

- ✅ PASS — Parser sanitizes genotypes/rsids/chromosomes.
  Evidence:
  ```
  src/lib/analysis/parser.ts
  VALID_RSID_PATTERN, VALID_CHROMOSOME_PATTERN, VALID_GENOTYPE_PATTERN
  sanitizeGenotype(...) returns null on invalid data
  ```

- ✅ PASS — XSS via filename/content not observed in UI rendering.
  Evidence:
  ```
  src/routes/+page.svelte
  // file content is parsed, not injected into DOM

  src/lib/components/ExportButtons.svelte
  // output is downloaded; not injected into DOM
  ```

- ⚠️ WARN — Large files are read into memory with `file.text()`; size limit helps but memory spikes still possible.
  Evidence:
  ```
  src/routes/+page.svelte
  const content = await file.text();
  ```

## Issues Found (Actionable)
1) External data egress paths exist (MyVariant/Ensembl/GWAS). Even if unused, the CSP and server route allow egress of rsids.
2) “Destroy” does not explicitly overwrite sensitive data in memory; relies on GC only.

## Recommendations
1) If public release is strictly offline: remove/feature-flag `src/lib/api/client.ts` and `src/routes/api/analyze/+server.ts`, and tighten CSP `connect-src` to `'self'` only.
2) Implement explicit memory clearing on Destroy (overwrite large strings/Maps, reset stores, and null references) to minimize retention before GC.
3) Consider streaming parsing (or chunked reading) to reduce memory spikes for large files.
4) If external APIs are intended, provide a clear opt-in flow and privacy disclosure (what is sent, to whom, and why).
