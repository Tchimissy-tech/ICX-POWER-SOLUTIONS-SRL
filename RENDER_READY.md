# ICX POWER SOLUTIONS — Corrected Render Package

This package corrects the multilingual presentation and public-image portability issues found in the submitted website source. It is ready to be committed to the repository connected to Render.

## Multilingual correction

The public pages now obtain visible text from the active locale dictionary rather than embedding French copy inside the components. The language selector applies consistently to the homepage, study journey, services, sourcing request form, partnership request form, partners page, work-permit page, university directory, institution detail page, secure dossier, loading state, and 404 page. Country labels in the institution directory are localized as well. The selected language is preserved in local storage, and the document direction switches to RTL for Arabic.

## Image correction

All **public page imagery** is stored as local public assets. The former public-page `/manus-storage/...` image URLs have been removed, so Render does not need access to Manus Storage to render the homepage, study, sourcing, logo, or profile images. The build includes the supplied logo and K Marcel TRAORE profile picture alongside three bundled page visuals.

| Public URL | File location | Purpose |
|---|---|---|
| `/icx-power-solutions-logo.png` | `client/public/icx-power-solutions-logo.png` | Header and footer logo |
| `/k-marcel-traore.png` | `client/public/k-marcel-traore.png` | K Marcel TRAORE profile |
| `/images/hero-global-team.jpg` | `client/public/images/hero-global-team.jpg` | Homepage hero |
| `/images/study-guidance.jpg` | `client/public/images/study-guidance.jpg` | Study guidance section |
| `/images/sourcing-logistics.jpg` | `client/public/images/sourcing-logistics.jpg` | Sourcing page hero |

The submitted archive does not include the Jean Lansana KOUNDOUNO photograph. The website therefore deliberately retains the safe `JLK` initials fallback instead of producing a broken image. The exact replacement procedure is included in `client/public/images/README.md` and can be completed when the intended photograph is supplied.

> The server still has a `/manus-storage/*` route for authenticated applicant-document storage. That route is separate from public website imagery and requires the production storage configuration described in the deployment guide.

## Validation completed

The corrected package passed `pnpm check`, `pnpm build`, and `pnpm test` (3 passing tests). The production server returned HTTP 200 for the homepage, profile image, and hero image both locally and through the sandbox public URL. The English and Arabic interfaces were also checked in a browser; the Arabic page correctly uses right-to-left layout.

## Render deployment

Push this package to the Git repository connected to Render. The supplied `render.yaml` runs `pnpm install --frozen-lockfile && pnpm build` and then `pnpm start`. Configure the production environment variables described in `docs/DEPLOYMENT_RENDER.md`; these include the database, authentication, document storage, and owner settings required for authenticated features.
