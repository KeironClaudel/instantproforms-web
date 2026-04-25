# InstantProforms Web

Frontend de InstantProforms construido con React, TypeScript y Vite. Consume la API desplegada en Render y se despliega en Vercel.

## Features

- Login, registro de empresa y onboarding
- Configuracion de branding, impuestos y datos de empresa
- Carga y reemplazo de logo de empresa
- Dashboard y gestion de proformas
- Descarga, envio por correo y enlaces compartidos de proformas
- Soporte PWA con service worker y cola offline para requests soportados

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Workbox / Vite PWA

## Environment

Desarrollo local contra backend local:

```env
VITE_API_BASE_URL=https://localhost:7210
```

Produccion en Vercel usando rewrites hacia Render:

```env
VITE_API_BASE_URL=/
VITE_API_PUBLIC_ORIGIN=https://instantproformsapi.onrender.com
```

`vercel.json` reescribe `/api/:path*` hacia el backend en Render. Esto permite que las cookies de sesion y las imagenes de empresa se consuman desde el mismo origen de Vercel.

## Logos

El frontend no debe construir URLs directas a Supabase Storage. El flujo correcto es:

1. `GET /api/company-settings` devuelve `logoUrl`.
2. `logoUrl` apunta a `/api/company-settings/logo?v=...`.
3. El backend lee el archivo desde Supabase con credenciales de servidor.
4. El navegador recibe una respuesta `image/*` desde el backend.

Si ves una request del navegador a `/storage/v1/object/public/...`, el frontend esta usando una URL vieja o una respuesta cacheada. Refresca `GET /api/company-settings` y verifica que `logoUrl` empiece por `/api/company-settings/logo` o por el origen del backend.

El service worker cachea imagenes, pero `getCompanySettings(true)` agrega un parametro `refresh` para forzar una lectura fresca de la configuracion luego de actualizar el logo.

## Local Development

```bash
npm install
npm run dev
```

La app corre por defecto en:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Scripts

- `npm run dev`: servidor local de Vite
- `npm run build`: typecheck y build de produccion
- `npm run lint`: ESLint
- `npm run preview`: servir el build localmente

## Deployment

Vercel despliega el contenido generado por Vite. Mantener sincronizados:

- `VITE_API_BASE_URL=/`
- `VITE_API_PUBLIC_ORIGIN=https://instantproformsapi.onrender.com`
- rewrites de `/api/:path*` en `vercel.json`
