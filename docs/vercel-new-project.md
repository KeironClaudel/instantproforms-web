# Vercel New Project Setup

This repo is prepared to be deployed as a **new** Vercel project.

## Target API

Set this environment variable in Vercel for the new project:

```bash
VITE_API_BASE_URL=https://instantproformsapi.onrender.com
```

The tracked template file [`.env.production.template`](../.env.production.template) exists only as a reference. Do not commit a real production `.env` file.

## Recommended Vercel Project Settings

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node version: use the Vercel default or a current LTS release

## Important

- Create it from **New Project** in Vercel.
- Do **not** reuse or import settings from an existing Vercel project.
- Do **not** commit a `.vercel/project.json` file from another project into this repo.

## Why `vercel.json` is included

The root [`vercel.json`](../vercel.json) does two things:

- Rewrites SPA routes like `/login` and `/app/proforms/:id` back to `index.html`
- Forces fresh validation for `index.html`, `manifest.webmanifest`, and `sw.js` so the PWA update flow behaves correctly on Vercel

## Backend Compatibility Checklist

Because the frontend will run on a Vercel domain and the API on Render, the backend must allow the frontend origin.

Verify on the Render API:

- CORS allows the final Vercel frontend URL
- credentialed requests are enabled if auth cookies are required
- cookies are configured for cross-site usage when applicable
- HTTPS is enabled end to end

## After Deploy

Check these in the deployed app:

- `/login` loads directly in a fresh tab
- `/app/proforms` loads directly in a fresh tab
- `manifest.webmanifest` returns successfully
- `sw.js` returns successfully
- install prompt and offline shell still work
- API calls go to `https://instantproformsapi.onrender.com`
