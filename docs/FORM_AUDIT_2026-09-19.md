# Audit des formulaires et téléversements — 19 septembre 2026

## Résultat principal

Le message générique affiché par l’interface masquait une erreur serveur réelle. Sur une exécution de production sans base configurée, l’endpoint `request.submit` renvoie désormais explicitement : `Le stockage des demandes n’est pas configuré sur le serveur. Configurez DATABASE_URL dans Render.`

Le service Render **ICX POWER SOLUTIONS SRL** ne possédait initialement aucun service PostgreSQL associé dans l’espace Render vérifié. Une base PostgreSQL Free a maintenant été créée en Oregon (`icx-power-solutions-db`), mais le code source historique utilisait encore le pilote MySQL (`mysql2` / `mysql-core`). Le projet a donc été converti vers `drizzle-orm/node-postgres`, `pg` et le dialecte PostgreSQL avant le branchement de la base.

Les téléversements utilisent également le stockage sécurisé Forge/S3 du projet. Render doit donc fournir `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY`; sinon l’interface indique désormais que le stockage sécurisé des fichiers est absent au lieu d’afficher une erreur générique.

## Correctifs intégrés au code

Les champs texte et email sont nettoyés par suppression des espaces périphériques avant validation. Les échecs de persistance et de téléversement sont convertis en erreurs tRPC actionnables. Le formulaire de contact affiche le message précis reçu du serveur. Les téléversements après création d’une demande sont traités séparément et une erreur de fichier est affichée sans prétendre que le fichier a été enregistré. Le dossier authentifié affiche aussi les erreurs de création et de téléversement.

La taille maximale reste de 4 Mo par fichier, avec vérification du type MIME et de la signature binaire côté serveur. Les formats acceptés sont PDF, JPEG et PNG.

## Configuration Render requise

1. La base PostgreSQL Render a été créée dans la région **Oregon**, sur le plan **Free**.
2. Synchroniser le Blueprint `render.yaml` afin que `DATABASE_URL` référence `icx-power-solutions-db` avec la propriété `connectionString`.
3. Ajouter au service web les deux variables de stockage Forge/S3 : `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY`.
4. Exécuter les migrations PostgreSQL (`pnpm db:push`) avant le premier envoi réel.
5. Redéployer, puis tester les parcours contact, demande de service, ajout de fichiers et dossier authentifié.

La base Render a été créée après accord explicite du propriétaire. La configuration du stockage de fichiers reste une étape distincte, car aucune clé Forge/S3 ne doit être inventée ou exposée dans le code source.
