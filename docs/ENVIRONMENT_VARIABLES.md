# Variables d'Environnement et Secrets Requis

Pour déployer la plateforme ICX POWER SOLUTIONS avec le système complet de notifications e-mail vers **`icxps.sale@outlook.com`**, configurez les variables suivantes dans votre interface de secrets :

| Variable | Description | Exemple / Valeur par défaut |
|---|---|---|
| `ADMIN_NOTIFICATION_EMAIL` | Référence documentaire des alertes, demandes et documents | `icxps.sale@outlook.com` (verrouillé côté serveur) |
| `APP_BASE_URL` | URL racine publique du site (liens de décision 1-clic) | `https://icx-power-solutions.com` |
| `RESEND_API_KEY` | Clé API Resend (Option recommandée) | `re_123456789...` |
| `RESEND_FROM` | Adresse d'expédition validée dans Resend | `ICX Notifications <onboarding@resend.dev>` ou domaine dédié |
| `OUTLOOK_SMTP_USER` | Identifiant du compte Outlook d'envoi (si option SMTP) | `icxps.sale@outlook.com` |
| `OUTLOOK_SMTP_PASS` | Mot de passe d'application généré sur Outlook | `xxxx-xxxx-xxxx-xxxx` |
| `SMTP_HOST` | Serveur SMTP Outlook | `smtp.office365.com` |
| `SMTP_PORT` | Port TLS sécurisé | `587` |
| `SENDGRID_API_KEY` | Clé API SendGrid (Option alternative) | `SG.xxxxxxxx...` |
| `DATABASE_URL` | Connexion à la base de données MySQL | `mysql://...` |
| `JWT_SECRET` | Clé de signature des sessions | Valeur aléatoire longue |

## Identité super-administrateur confirmée

L'adresse **`icxps.sale@outlook.com`** est codée comme identité canonique du super-administrateur côté serveur. À sa première connexion OAuth, le compte est automatiquement créé ou réconcilié avec `role = super_admin` et `accountStatus = approved`. Les connexions suivantes réappliquent cette invariant si nécessaire. Les autres comptes restent bloqués sur les opérations protégées tant qu'ils sont `pending` ou `rejected`.
