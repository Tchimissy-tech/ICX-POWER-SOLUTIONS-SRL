# Deployment on Render

> This guide is for a future GitHub-to-Render deployment. The active development environment is Manus WebDev.

## 1. Create infrastructure

Create a Render Web Service from the GitHub repository and provision a managed MySQL-compatible database or configure a supported external database. Provision a private S3-compatible bucket for sensitive applicant documents. Do **not** use public bucket access for application files.

## 2. Configure environment variables

Set the following secrets in Render’s encrypted environment interface. Values must never be committed.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Production database connection |
| `JWT_SECRET` | Long random server session signing secret |
| `VITE_APP_ID` | OAuth client identifier |
| `OAUTH_SERVER_URL` | OAuth service URL |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL |
| `OWNER_OPEN_ID` | Initial ICX administrator identity |
| `BUILT_IN_FORGE_API_URL` | Only when using Manus Forge-compatible services |
| `BUILT_IN_FORGE_API_KEY` | Server-side API key, never browser-exposed |

For a non-Manus OAuth provider, replace the auth integration deliberately; do not expose provider secrets in Vite variables.

### OAuth redirect configuration

Sign-in and account creation now start at the server route `/api/oauth/start`. The server builds the redirect URI from the public Render host, creates the one-time state nonce cookie, and then redirects to the OAuth portal. This keeps the application ID and state handling out of the browser bundle and works behind Render’s HTTPS proxy. Register the exact production callback URL `https://YOUR_RENDER_HOST/api/oauth/callback` in the OAuth application; also register the custom-domain variant when a custom domain is attached. `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and `JWT_SECRET` must be set in Render. The route returns a clear 503 configuration error instead of sending users to a broken login URL when the application ID is missing.

### Source-grounded assistant

The ICX assistant runs entirely server-side. It receives the current visitor question, selects only the relevant entries from the reviewed source registry in `server/chatKnowledge.ts`, and displays those references under its answer. The registry distinguishes **ICX pages**, **official authorities or institutions**, and **partner reference sites**. It never treats a public reference link as confirmation of an ICX partnership.

For an allowlisted external official or partner source, the server may fetch a short current HTML extract with a 3.5-second deadline and a four-hour in-memory cache. The assistant receives no visitor data in that request; it only reads the listed public URL. If an external page is unreachable or changes format, the assistant remains available using the reviewed registry entry and tells the visitor to confirm volatile details with the authority. This feature needs no additional Render environment variable.

Keep the registry reviewed: add a source only after validating its URL and authority, remove an obsolete source promptly, and never place credentials or private URLs in it. The assistant’s model call requires `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`; without them it returns a source-based fallback instead of an unsourced answer.

The public **Sign in** and **Create account** buttons use the Manus OAuth application configured by `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`. The official defaults are `https://api.manus.im` for `OAUTH_SERVER_URL` and `https://manus.im` for `VITE_OAUTH_PORTAL_URL`; they are also declared in `render.yaml` and used as safe code defaults. `VITE_APP_ID` remains mandatory and must be the real OAuth application ID associated with this deployment. The application does not create a second local password system, because doing so would bypass the configured identity provider and create an unsafe parallel account store.

Public service requests receive a private upload token after submission. Document uploads require `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`, plus the reviewed migration `drizzle/0002_request_documents.sql`. The storage bucket must be private and the database must be migrated before enabling uploads.

## 2.1 Verified company references shown on the website

The homepage displays the following public registration references for ICX POWER SOLUTIONS SRL: CUI **54675848**, Trade Register number **J2026031336000**, EUID **ROONRC.J2026031336000**, registered office **Str. Hlincea nr. 47, Iași, Romania**, incorporation date **13 May 2026**, and primary CAEN **7020** (business and management consultancy). These were cross-checked against [RisCo’s company listing](https://www.risco.ro/verifica-firma/icx-power-solutions-cui-54675848) and [ListaFirme’s listing](https://listafirme.ro/icx-power-solutions-srl-54675848/); revalidate them against ONRC before legal use.

## 3. Build and start

Use `pnpm install --frozen-lockfile && pnpm build` as the build command and `pnpm start` as the start command. Configure a health check to a lightweight public route such as `/`.

## 4. Database migration

Run `pnpm drizzle-kit generate` during schema authoring, review every generated SQL file, and apply the reviewed migration in a controlled release step. Back up production before any schema change. Do not use the initial schema file as a substitute for a migration review.

## 5. Pre-launch controls

Enable HTTPS, restrict database network access, set a production domain, configure backups, add monitoring, set a retention schedule, run a security review, configure a real transactional email provider, add edge rate limits, and finalize legal pages, consent, DPA, and incident procedures.
