# Importer le Blueprint Render dans GitHub

Le fichier `render.yaml` décrit le service web **ICX POWER SOLUTIONS SRL**, la base PostgreSQL Free et la liaison automatique de `DATABASE_URL`. Il ne contient aucune clé secrète.

## Méthode automatique depuis un clone local

Clonez le dépôt, placez-vous dans sa racine, copiez le script fourni puis exécutez :

```bash
git clone https://github.com/Tchimissy-tech/ICX-POWER-SOLUTIONS-SRL.git
cd ICX-POWER-SOLUTIONS-SRL
bash scripts/import-render-blueprint.sh
```

Le script écrit `render.yaml`, crée un commit et pousse le commit sur la branche `main`. GitHub demandera une authentification si elle n’est pas déjà configurée.

Si le script est fourni séparément, copiez-le dans le dépôt avant exécution :

```bash
mkdir -p scripts
cp /chemin/vers/import-render-blueprint.sh scripts/import-render-blueprint.sh
chmod +x scripts/import-render-blueprint.sh
bash scripts/import-render-blueprint.sh
```

## Méthode GitHub Web

Créez ou ouvrez le fichier `render.yaml` à la racine du dépôt, remplacez son contenu par celui fourni dans cette livraison, puis validez directement sur la branche `main` ou via une Pull Request.

## Synchronisation Render

Dans Render, ouvrez **New → Blueprint**, sélectionnez le dépôt `Tchimissy-tech/ICX-POWER-SOLUTIONS-SRL` et la branche `main`, puis confirmez la synchronisation. Si le service et la base existent déjà, Render doit les rattacher aux ressources portant les noms **ICX POWER SOLUTIONS SRL** et `icx-power-solutions-db`; vérifiez l’aperçu avant de confirmer pour éviter la création d’un doublon.

Le Blueprint crée ou met à jour `DATABASE_URL` depuis la propriété `connectionString` de la base PostgreSQL. La migration est exécutée avant le démarrage avec `pnpm drizzle-kit migrate`.

## Variables à renseigner dans Render

Les variables marquées `sync: false` doivent être renseignées dans le tableau de bord Render :

| Variable | Utilisation |
|---|---|
| `VITE_APP_ID` | Client ID public de l’authentification Manus |
| `BUILT_IN_FORGE_API_URL` | Endpoint de stockage sécurisé |
| `BUILT_IN_FORGE_API_KEY` | Clé secrète de stockage sécurisé |
| `OWNER_OPEN_ID` | Identifiant Manus du propriétaire administrateur |
| `OPENAI_API_KEY` | Assistant conversationnel source-grounded |

Ne placez jamais ces valeurs dans `render.yaml`, GitHub, le frontend ou une archive publique.

## Contrôles après déploiement

Après le premier déploiement, vérifiez successivement la page d’accueil, `/services/study`, `/services/work`, `/services/real-estate`, `/services/commerce`, `/services/mandates`, `/study/contact` et `/dossier`. Effectuez ensuite un envoi de contact, un envoi avec un fichier PDF de moins de 4 Mo, puis contrôlez dans les logs Render que la migration, l’insertion PostgreSQL et le stockage du fichier se terminent sans erreur.
