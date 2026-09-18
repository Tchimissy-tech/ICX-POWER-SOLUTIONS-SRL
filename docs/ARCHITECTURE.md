# Architecture Decision Record

## Product boundary

ICX POWER SOLUTIONS is an international **orientation, opportunity, and service platform**. It is not an educational institution. The platform separates public institution information from ICX’s optional orientation or application-support services.

## Bounded modules

| Module | Public capabilities | Authenticated capabilities | Control point |
| --- | --- | --- | --- |
| Study orientation | Destinations, verified institution links, guidance | Personal application file | Official source + `verifiedAt` |
| Applications | Status explanation | Create file, view own records, upload documents | Ownership check on every mutation |
| Institutions | Search and profile | Staff curation in later CMS iteration | Relationship type and source URL |
| Partnerships | Publicly qualified relationship label | Submit proposal, staff review | No official label without confirmation |
| Sourcing | Guided request intake | Staff triage and follow-up | Status workflow and audit log |
| Real estate/e-commerce | Information architecture | Future marketplace capability | No live inventory/payment until governed |

## Request path

`React screen → tRPC procedure → Zod validation → authorization/ownership check → Drizzle query → MySQL/TiDB`.

File bytes follow a separate route: `authenticated user → tRPC validation → signature and size control → private S3 object → metadata/audit record`. The database does not store file bytes.

## Authorization model

The `user` role is the default public account. Elevated roles (`super_admin`, `administrator`, `admissions_manager`, `sourcing_manager`, `real_estate_manager`, `partnership_manager`, `editor`, `agent`) are assigned outside the public interface. The initial staff dashboard is available only after server-side role authorization.

## Future extensions

The schema permits a headless CMS layer, server-side publication workflow, per-language content records, institution/programme linking, protected staff queues, notification provider, antivirus scanning, payment adapter, CRM sync, mobile API, semantic search, and verified external data connectors.
