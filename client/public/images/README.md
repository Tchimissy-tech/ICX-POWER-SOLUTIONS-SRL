# Image assets bundled with the application

All website visual assets are stored below `client/public` and are therefore emitted into the Vite build as root-relative URLs. Render serves them directly with the deployed application; they do not depend on Manus Storage or an external image URL.

| Public URL | Source | Usage |
|---|---|---|
| `/icx-power-solutions-logo.png` | Supplied archive | Header and footer identity |
| `/k-marcel-traore.png` | Supplied archive | K Marcel TRAORE team profile |
| `/jean-lansana-koundouno.jpg` | Supplied by the user | Jean Lansana KOUNDOUNO profile |
| `/images/hero-global-team.jpg` | Locally bundled visual | Homepage hero |
| `/images/study-guidance.jpg` | Locally bundled visual | Homepage study guidance section |
| `/images/sourcing-logistics.jpg` | Locally bundled visual | Sourcing page hero |
| `/images/home/consulting-advisory.jpg` | Unsplash business consulting collection | Homepage consulting card — real professional consulting meeting |
| `/images/home/strategic-partnerships.jpg` | Werner Pfennig / Pexels licence | Homepage strategic-partnership card — real international agreement meeting |
| `/images/work/*` | Sourced documentary/illustrative images | Work-sector examples on the work-permit page |
| `/images/partnership/*` | Sourced documentary/illustrative images | Professional and Africa–Europe cooperation imagery |

## Jean Lansana KOUNDOUNO profile photo

The supplied photograph is bundled at `client/public/jean-lansana-koundouno.jpg` and the leader mapping now uses `/jean-lansana-koundouno.jpg`.

The work and partnership image files are copied into `client/public/images` so Vite emits them into the production bundle and Render serves them locally.

## Homepage photography provenance

The consulting homepage image is a real consultation meeting selected from the [Unsplash business-consulting collection](https://unsplash.com/s/photos/business-consulting). The strategic-partnerships homepage image is **Multinational business meeting with agreement signing, featuring diverse professionals and flags**, photographed by [Werner Pfennig on Pexels](https://www.pexels.com/photo/men-in-business-suits-shaking-hands-beside-a-woman-in-black-blazer-6949994/) and used under the [Pexels licence](https://www.pexels.com/license/). Both files are bundled locally so the deployed application has no runtime dependency on the source platforms.

## Original activity-specific visual set

The `expertise-*`, `consulting-*`, `partnership-*`, `affiliations-network.jpg` and `official-sources.jpg` assets were generated specifically for this project. They are local, activity-specific visuals with no embedded photographer credit, watermark or readable text. Each tab or sector card uses its own image rather than reusing an unrelated generic photograph.
