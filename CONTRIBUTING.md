# Contributing

Thanks for helping improve whatsmydna.

## Quick Start

```bash
npm install
npm run check
npm run test
```

## Guidelines

- Keep analysis 100% client-side. No new external API calls during analysis.
- Avoid heavy dependencies. Prefer small, tree-shakable utilities.
- Preserve privacy: no analytics, tracking, or telemetry.
- Keep the bundle lean and reuse existing utilities when possible.
- Add or update tests when changing parsing, matching, or filtering logic.

## Pull Requests

- Describe the user-visible impact and any data/privacy implications.
- Include test output for `npm run test` and `npm run check`.
