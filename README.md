# ICX POWER SOLUTIONS | DealFlare & Sourcing

A modular, multilingual foundation for an international opportunity platform spanning study orientation, sourcing, partnerships, real estate, e-commerce evolution, and an authenticated applicant workspace.

## What is implemented

The public experience includes a responsive premium homepage, services ecosystem, study-orientation flow, institution directory, institution detail pages, partner transparency page, sourcing request form, partnership request form, light/dark mode, and a persistent language selector for French, English, Romanian, Portuguese, and Arabic RTL mode.

The secure application foundation includes Manus OAuth sign-in, applicant-owned application records, server-side controlled document upload, document metadata, bounded file types (PDF/JPEG/PNG), a 4 MB file limit, file signature verification, isolated storage keys, and audit logging. The dashboard is role-gated and shows operational counts and non-sensitive request summaries.

## Architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Web client | React 19, TypeScript, Tailwind CSS, Wouter | Public pages, accessible responsive UI, authenticated portal |
| Server | Express, tRPC, Zod | Typed validation, authorization gates, server-side mutations |
| Database | MySQL/TiDB via Drizzle | Users, applications, documents, institutions, programmes, requests, audit records |
| Authentication | Manus OAuth | Secure session and identity provisioning |
| Object storage | Manus S3 storage helper | Private document file bytes; database stores metadata and storage key only |

## Local development

```bash
pnpm install
pnpm dev
```

Quality commands:

```bash
pnpm check
pnpm test
pnpm build
```

## Environment variables

The WebDev runtime injects database, authentication, storage, and Forge service variables. **Do not commit `.env` files, OAuth secrets, database URLs, tokens, or real applicant data.** For an external deployment, use the provided `.env.example` as a variable inventory and set the actual values only in the host’s encrypted environment configuration.

## Administrator guide

1. Assign staff roles only from a protected database/admin operation. Public accounts default to `user`.
2. Before publishing an institution, save its official source URL, `verifiedAt` date, and a transparent `relationshipType`.
3. Never label an organization **official partner** without explicit written confirmation.
4. Publish programmes, deadlines, fees, conditions, and admissions information only after verifying the official source. If unavailable, keep the record unpublished or state that the item is to be confirmed.
5. Treat applicant documents as confidential. Use least-privilege roles, do not expose storage URLs publicly, and record review actions in the audit log.
6. Configure legal notices, retention periods, privacy text, cookie consent, contact details, and data-processing obligations with qualified legal review before production launch.

## Security baseline

The prototype validates requests at the server boundary, requires authentication for applicant records, ensures ownership before document access/upload, limits allowed file formats, verifies magic bytes, bounds file size, uses opaque per-user storage paths, and maintains an audit trail. Production hardening still requires antivirus scanning, rate limiting at the edge, retention workflows, encrypted backup policy, monitoring/alerting, security headers, penetration testing, formal privacy/legal review, and a protected workflow for staff role assignment.

## Deployment

The current project is managed through Manus WebDev. For a Render migration, provision a managed PostgreSQL or MySQL database and an S3-compatible private bucket, set all secrets in Render’s dashboard, run migrations during release, configure HTTPS, health checks, and automated backups, then connect the repository via Render’s GitHub integration.

Suggested build/start commands for this Node service:

```bash
pnpm install --frozen-lockfile && pnpm build
pnpm start
```

## Data integrity rules

This codebase deliberately avoids fabricated admissions conditions, fees, programme claims, legal contact details, testimonials, addresses, statistics, certifications, and partnerships. Records must remain unpublished until an administrator validates their official sources.
