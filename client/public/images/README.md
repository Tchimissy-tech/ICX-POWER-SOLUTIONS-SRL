# Image assets bundled with the application

All website visual assets are stored below `client/public` and are therefore emitted into the Vite build as root-relative URLs. Render serves them directly with the deployed application; they do not depend on Manus Storage or an external image URL.

| Public URL | Source | Usage |
|---|---|---|
| `/icx-power-solutions-logo.png` | Supplied archive | Header and footer identity |
| `/k-marcel-traore.png` | Supplied archive | K Marcel TRAORE team profile |
| `/images/hero-global-team.jpg` | Locally bundled visual | Homepage hero |
| `/images/study-guidance.jpg` | Locally bundled visual | Homepage study guidance section |
| `/images/sourcing-logistics.jpg` | Locally bundled visual | Sourcing page hero |

## Jean Lansana KOUNDOUNO profile photo

The submitted archive does **not** contain a photo for Jean Lansana KOUNDOUNO. Until that image is supplied, the website intentionally renders the `JLK` initials rather than a broken image. When the photo is received, save it as `client/public/images/jean-lansana-koundouno.jpg`, then set the `image` field of the Jean Lansana KOUNDOUNO entry in `client/src/lib/leaders.ts` to `/images/jean-lansana-koundouno.jpg`.
