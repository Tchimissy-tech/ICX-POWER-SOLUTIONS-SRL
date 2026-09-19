# Modifications implemented

## Authentication and account creation

The public header now provides distinct **Se connecter** and **Créer un compte** actions. Both use the configured ICX OAuth flow, with explicit `signIn` and `signUp` actions. If the OAuth environment variables are missing, the user receives a visible configuration message instead of a silent failure. The Render configuration must define `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`.

## Navigation and page position

Every route change now scrolls the document to the top. This prevents a new page from opening at the previous page’s scroll position.

## Work permits

The work-permit page now links to `/work-permits/contact`, not to the partnership page. The new flow asks for the applicant’s profile, target country, supporting information and an optional appointment request. It explains that ICX assistance is subject to review and a signed service agreement, and makes no guarantee of employment or permit approval.

## Partner contact

The existing `/partnership` page remains a separate contact form for companies, universities, schools, suppliers, agencies, investors, institutions, organisations and individuals/other applicants.

## New service flows

Dedicated routes are now available for:

- `/services/real-estate`: property search type, criteria, documents, response time and appointment request;
- `/services/commerce`: catalogue, quotation and B2B contact request;
- `/services/mandates`: project and mandate qualification request;
- `/study/contact`: public student guidance and assistance request without requiring an account first.

All these flows persist public requests through the existing request API.

## Universities and AAFT

The featured directory now contains one requested university from France, Belgium, Russia and China: Université de Bordeaux, Université libre de Bruxelles, M. V. Lomonosov Moscow State University and Peking University. University cards now show **Info sur l’Université** and **Contacter ICX POWER SOLUTIONS SRL** instead of the previous official-site/admission labels. AAFT is shown only as **AAFT Association** in the partner directory and is no longer listed as a university.

The supplied photograph is now bundled as `client/public/jean-lansana-koundouno.jpg` and connected to Jean Lansana KOUNDOUNO’s profile.

## Validation

`pnpm check`, `pnpm build` and `pnpm test` pass. The browser was checked on the new real-estate route, study-contact route and university directory. The new routes render at the top of the page and expose the expected forms and labels.

## Enhancements added on 2026-09-18 23:31

The university filter now has a working country selector, free-text search, result count and reset button. The directory now contains ten institutions from France, Belgium, Russia, China, Romania, Canada and the United States.

The Services page now includes a message from K Marcel TRAORE, Responsable des opérations et de la coordination. The Partners page now includes a message from Jean Lansana KOUNDOUNO, Représentant légal, anonymised illustrative testimonials, professional meeting images and Africa–Europe cultural cooperation imagery with visible credits retained.

The Work permits page now includes local Render-compatible illustrative photos for catering, construction, delivery/logistics, electrical maintenance, cleaning, driving/transport and retail/large stores. They are explicitly labelled as sector illustrations and not job offers or placement guarantees.

All new image paths are root-relative files under `client/public/images`, so they are emitted by Vite and served by Render without Manus Storage or remote runtime dependencies.
