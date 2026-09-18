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

## 3. Build and start

Use `pnpm install --frozen-lockfile && pnpm build` as the build command and `pnpm start` as the start command. Configure a health check to a lightweight public route such as `/`.

## 4. Database migration

Run `pnpm drizzle-kit generate` during schema authoring, review every generated SQL file, and apply the reviewed migration in a controlled release step. Back up production before any schema change. Do not use the initial schema file as a substitute for a migration review.

## 5. Pre-launch controls

Enable HTTPS, restrict database network access, set a production domain, configure backups, add monitoring, set a retention schedule, run a security review, configure a real transactional email provider, add edge rate limits, and finalize legal pages, consent, DPA, and incident procedures.
