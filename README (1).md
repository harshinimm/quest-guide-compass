# Quest Guide Compass

A browser extension + web app for guided tasks and quests — helping users navigate multi-step processes without losing track of where they are.

> Personal project, work in progress.

## What it does

<!-- Fill in: 1-2 sentences on the core mechanic. e.g. -->
<!-- "Quest Guide Compass turns any multi-step workflow (onboarding, tutorials, checklists) into a guided 'quest' — the extension overlays step-by-step guidance directly on the page you're using, while the web app lets you author and manage quests." -->

- **Browser extension** — [what it does on the page, e.g. overlays guidance, tracks progress, highlights next step]
- **Web app** — [what it's used for, e.g. creating/editing quests, viewing progress, dashboard]

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19)
- Vite 7 (separate build config for the extension — `vite.extension.config.ts`)
- TypeScript
- Tailwind CSS 4 + Radix UI (shadcn-style components)
- React Hook Form + Zod for forms/validation
- Built with [Lovable](https://lovable.dev)

## Project structure

```
quest-guide-compass/
├── extension/     # Browser extension source
├── src/           # Web app source
├── scripts/       # Build/dev scripts
├── vite.config.ts
└── vite.extension.config.ts
```

## Getting started

```bash
# install dependencies
bun install   # or npm install

# run the web app in dev mode
bun dev

# build the web app
bun run build            # production build
bun run build:dev        # development-mode build
bun run preview          # preview the production build

# extension
bun run dev:extension    # build extension, watch for changes
bun run build:extension  # build extension for release (runs scripts/prepare-extension.mjs)

# linting / formatting
bun run lint
bun run format
```

Then load the extension:
1. Go to `chrome://extensions`
2. Enable Developer Mode
3. Load unpacked → select the extension build output folder (produced by `build:extension`)

## Status

Actively in development — not yet ready for external use.

## License

<!-- pick one, e.g. MIT -->
