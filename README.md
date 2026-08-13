# North Eastern Lawn

North Eastern Lawn is a responsive React and Express application featuring a public marketing website and a Supabase-authenticated customer portal. The portal lets customers securely manage their properties, view scheduled visits, check invoices, and submit property-care requests.

## Technical model

Customer identity and portal data use the supplied Supabase project. The browser only receives the Supabase URL and publishable key; the PostgreSQL connection remains server-only. The `supabase/migrations/001_north_eastern_lawn.sql` migration creates the portal schema and Row Level Security rules so authenticated customers can access only their own profile, properties, invoices, visits, and requests.

## Railway configuration

Set the following Railway variables before deployment. Never put these values in source control.

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL, used by the browser client. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase publishable key, used by the browser client. |
| `SUPABASE_DATABASE_URL` | Yes for server-side maintenance only | Direct PostgreSQL connection; keep private. |
| `SUPABASE_OAUTH_CLIENT_ID` | Only if the configured OAuth client is used by server-side integrations | Supplied Supabase OAuth client identifier. |
| `APP_PUBLIC_URL` | Yes | `https://northeasternlawn.up.railway.app` for canonical deployment context. |
| `NODE_ENV` | Yes | `production`. |

The separate GitHub access token is intentionally **not** a Railway variable. It is only needed for source control and should be revoked after publishing if it was exposed.

## Supabase Auth configuration

In Supabase Authentication URL Configuration, set the Site URL to `https://northeasternlawn.up.railway.app` and add `https://northeasternlawn.up.railway.app/dashboard` to the redirect URL allow list. For local or preview testing, add the corresponding temporary preview origin plus `/dashboard`.

## Run locally

```bash
pnpm install
pnpm run dev
```

Run the schema migration only in a secured environment with `SUPABASE_DATABASE_URL` set:

```bash
node scripts/apply-supabase-schema.mjs
```

Validate before deployment:

```bash
pnpm test
pnpm run check
pnpm run build
```
