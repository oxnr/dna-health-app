# Review: whatsmydna (SvelteKit)

## Summary of findings
- Bundle size is dominated by client-side analysis and optional PDF export; `snpDatabase.ts` is small (~24KB) but will become dead weight once API-based annotation lands. `jspdf` is still a large optional chunk.
- Several dependencies are unused (`file-saver`, `idb-keyval`) and can be removed to shrink install/bundle size.
- Current architecture tightly couples parsing, SNP lookup, and UI; a clean split between local parsing and remote annotation will simplify the hybrid model and error handling.
- Accessibility and mobile ergonomics are good baseline but need improvements (modal semantics, keyboard handling, small-screen stats grid).

## Priority items
### P0
- None found. No critical bugs or security issues blocking release.

### P1
- Bundle: remove unused dependencies and re-evaluate PDF export strategy (heavy optional chunk).
- Architecture: add explicit API failure handling and partial-results rendering (e.g., MyVariant failure should not hide Ensembl/GWAS results).
- UI/UX: make the destroy-data modal a real dialog (`role="dialog"`, `aria-modal`, focus trap) and improve small-screen layout (stats grid).

### P2
- Types: tighten `impact` typing and prefer ISO timestamps over `Date` objects for API responses.
- Parsing: streaming/worker-based parsing for large files to avoid main-thread stalls.
- Replace category string matching with stable category IDs to reduce fragile `includes` checks.

## Specific code changes recommended
- Remove unused deps and lockfile entries:
  - `package.json` (and `package-lock.json`): remove `file-saver`, `idb-keyval`.
- API client layer:
  - Add `src/lib/api/` with typed clients and a small fetch wrapper (timeout, retry/backoff, `AbortController`).
  - Add SvelteKit server endpoints in `src/routes/api/` to proxy MyVariant/Ensembl/GWAS (avoid CORS and hide API keys if needed).
  - Use `Promise.allSettled` and surface per-source errors in UI.
- Analysis pipeline split:
  - Keep `parseGenome` locally; send only rsIDs/positions to API.
  - Build a new `analyzeRemote.ts` that composes API responses into `AnalysisResults`.
- UI:
  - Add dialog semantics + focus management for the destroy modal.
  - Add `aria-label` for icon-only buttons (theme, language).
  - Switch stats grid to `grid-cols-2 sm:grid-cols-4` for mobile readability.
- PDF export:
  - Keep dynamic import, but consider replacing with “Print to PDF” view or a server-generated PDF to avoid bundling `jspdf`.

## Files that can be simplified or removed
- `src/lib/analysis/snpDatabase.ts` (once API-based annotations replace local database)
- `file-saver` and `idb-keyval` (unused dependencies)
- `src/lib/analysis/analyzer.ts` can be split into local parser + remote annotator for the hybrid architecture

