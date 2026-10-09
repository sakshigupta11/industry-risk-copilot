Step 1 frontend foundation for a FinCrime case-review workspace. This project contains only the shared interface shell, routes, and local demo role state; it has no API, authentication, database, or workflow integration.

## Getting Started

Install dependencies and run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The root route redirects to `/cases`.

## Available routes

- `/cases` — case queue placeholder
- `/cases/new` — new case placeholder
- `/cases/[caseId]` — case workspace placeholder

## Verify

```bash
npm run lint
npm run build -- --webpack
```

The Webpack build command is included as a reliable local verification fallback where Turbopack cannot start its helper process.
