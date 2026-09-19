# Security Controls and Production Readiness

## Implemented baseline

The application validates typed procedure input with Zod, requires an authenticated session for applicant records, checks ownership before application document access, limits document MIME types, verifies PDF/JPEG/PNG file signatures, enforces a four-megabyte upload ceiling, sanitizes filenames, isolates stored objects by user and application, and creates audit entries for application and document actions.

## Required controls before real applicant data

| Risk | Required production control |
| --- | --- |
| Malware in documents | Async antivirus scan/quarantine and review status before access |
| High-volume abuse | Reverse-proxy and application-level rate limits, CAPTCHA where appropriate |
| Unauthorized staff access | Least-privilege RBAC, periodic entitlement review, MFA/SSO for staff |
| Data retention | Signed retention policy, timed deletion workflow, legal-hold procedure |
| Breach visibility | Central logs, immutable audit trail, alerting and incident runbook |
| Sensitive data loss | Encrypted backup, restoration drills, key lifecycle management |
| Browser threats | CSP, security headers, dependency scanning, XSS/CSRF review |
| Legal compliance | Privacy notice, cookie consent, DPA, lawful basis, DPIA and counsel review |

## Hard rules

Never store passwords in clear text. Never place applicant document URLs, personal documents, production database dumps, API keys, OAuth secrets, or personal data in Git. Never publish unverified university programmes, fees, conditions, admission dates, or partnership claims.
