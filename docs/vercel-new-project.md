# Vercel New Project Setup

This repo is prepared to be deployed as a **new** Vercel project.

## Target API

Set this environment variable in Vercel for the new project:

```bash
VITE_API_BASE_URL=/
```

In production, the frontend should call the API through the same Vercel origin. The root [`vercel.json`](../vercel.json) proxies `/api/*` to `https://instantproformsapi.onrender.com/api/*`.

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

- Proxies `/api/*` to the Render backend so auth cookies and CSRF work as same-origin requests from the browser
- Rewrites SPA routes like `/login` and `/app/proforms/:id` back to `index.html`
- Forces fresh validation for `index.html`, `manifest.webmanifest`, and `sw.js` so the PWA update flow behaves correctly on Vercel

## Backend Compatibility Checklist

Because Vercel will proxy `/api/*` to Render, the browser talks to the Vercel origin while Vercel forwards requests to the backend service.

Verify on the Render API:

- requests forwarded from Vercel are accepted
- credentialed auth still works end to end
- CSRF validation accepts the proxied request flow
- HTTPS is enabled end to end

## After Deploy

Check these in the deployed app:

- `/login` loads directly in a fresh tab
- `/app/proforms` loads directly in a fresh tab
- `manifest.webmanifest` returns successfully
- `sw.js` returns successfully
- install prompt and offline shell still work
- browser requests go to `/api/*` on the Vercel domain
- Vercel forwards those `/api/*` requests to `https://instantproformsapi.onrender.com`
