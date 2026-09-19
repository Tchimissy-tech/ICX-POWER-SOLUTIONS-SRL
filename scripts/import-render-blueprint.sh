#!/usr/bin/env bash
set -Eeuo pipefail

# Usage, from a local clone of the ICX repository:
#   bash scripts/import-render-blueprint.sh
#
# The script creates or replaces render.yaml with the production-safe Blueprint,
# commits it, and pushes it to the configured main branch. It never writes secrets.

REPO_URL="https://github.com/Tchimissy-tech/ICX-POWER-SOLUTIONS-SRL"
BRANCH="main"

if [[ ! -d .git ]]; then
  echo "Erreur: lancez ce script depuis la racine d’un clone GitHub du projet ICX." >&2
  exit 1
fi

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$REMOTE_URL" ]]; then
  git remote add origin "$REPO_URL"
fi

cat > render.yaml <<'YAML'
services:
  - type: web
    name: ICX POWER SOLUTIONS SRL
    runtime: node
    repo: https://github.com/Tchimissy-tech/ICX-POWER-SOLUTIONS-SRL
    branch: main
    region: oregon
    plan: free
    buildCommand: pnpm install --frozen-lockfile && pnpm build
    startCommand: pnpm start
    preDeployCommand: pnpm drizzle-kit migrate
    healthCheckPath: /
    autoDeployTrigger: commit
    envVars:
      - key: NODE_VERSION
        value: "22"
      - key: DATABASE_URL
        fromDatabase:
          name: icx-power-solutions-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: VITE_APP_ID
        sync: false
      - key: OAUTH_SERVER_URL
        value: https://api.manus.im
      - key: VITE_OAUTH_PORTAL_URL
        value: https://manus.im
      - key: BUILT_IN_FORGE_API_URL
        sync: false
      - key: BUILT_IN_FORGE_API_KEY
        sync: false
      - key: OWNER_OPEN_ID
        sync: false
      - key: OPENAI_API_KEY
        sync: false

databases:
  - name: icx-power-solutions-db
    region: oregon
    plan: free
    databaseName: icx_power_solutions_db
    user: icx_power_solutions_db_user
    postgresMajorVersion: 18
YAML

if ! git diff --quiet -- render.yaml; then
  git add render.yaml
  git commit -m "chore: configure Render PostgreSQL blueprint"
fi

git push origin "$BRANCH"
echo "Render Blueprint envoyé sur $REPO_URL, branche $BRANCH."
echo "Dans Render: New > Blueprint, sélectionnez ce dépôt puis confirmez la synchronisation."
echo "Variables sync:false à renseigner dans Render: VITE_APP_ID, BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY, OWNER_OPEN_ID et OPENAI_API_KEY."
