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

## Jean Lansana KOUNDOUNO profile photo

The supplied photograph is bundled at `client/public/jean-lansana-koundouno.jpg` and the leader mapping now uses `/jean-lansana-koundouno.jpg`.
