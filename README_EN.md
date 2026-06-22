# zeya Knowledge Base

A place for notes, memories, knowledge, and ideas.

This repository contains zeya's personal knowledge base and VitePress site configuration. It is adapted from the Nólëbase / VitePress structure and publishes Markdown notes as a static site.

## Development

```bash
pnpm install
pnpm docs:dev
```

## Build

```bash
pnpm run build
```

The generated site is written to `.vitepress/dist`.

## Deployment

The current deployment target is Netlify. See `netlify.toml` for build settings.
