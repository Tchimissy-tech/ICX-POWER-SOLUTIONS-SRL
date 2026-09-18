# Validation Record

## 2026-09-18

The public homepage was opened in the running WebDev preview. The verification confirmed that the ICX header, main navigation, language selector, theme toggle, hero image, headline, study and sourcing calls to action, service entry cards, disclosure-oriented content blocks, and floating `START YOUR PROJECT` launcher rendered correctly in the desktop viewport.

The preview was available at the project’s managed development URL during validation. The page had no surfaced TypeScript, dependency, or language-service errors. Unit tests passed for logout, public-account denial of staff metrics, and the request-form honeypot. A production build passed after introducing route-level code splitting.

A production bundle warning remains for a larger shared JavaScript chunk. It is non-blocking; route-level lazy loading has been added, and further package-level splitting can be evaluated after real-world analytics identify high-traffic routes.

## Final visual and runtime check

The institution directory was also opened in the managed preview. It displayed the search input, relationship labels, explicit “no partnership presumed” content, source-revalidation notices, and official external links for Babeș-Bolyai University and AAFT. The final environment check reports the development server running with dependencies healthy and no LSP or TypeScript diagnostics. Expected unauthenticated-session messages appeared only because the preview was viewed without an OAuth session.
