# Correctif — erreur de connexion OAuth sur Render

## Cause confirmée

Le message affiché par le site provenait directement de `/api/oauth/start`. Le service Render ne recevait pas `VITE_APP_ID`, qui est l’identifiant de l’application OAuth enregistrée pour ce site. `OAUTH_SERVER_URL` dispose déjà d’une valeur par défaut côté serveur, mais l’identifiant d’application ne peut pas être inventé ou généré : il doit correspondre à une application OAuth réelle et à son URL de callback.

## Correctif logiciel

La route `/api/oauth/start` ne renvoie plus de JSON brut aux visiteurs lorsque la configuration est absente. Elle redirige vers la page d’accueil avec un message localisé et compréhensible. Le flux fonctionnel reste côté serveur : il construit le callback public Render, crée le nonce, pose le cookie d’état et redirige vers le portail OAuth.

## Configuration Render obligatoire

Dans Render, définir :

- `VITE_APP_ID` : identifiant réel de l’application OAuth ;
- `OAUTH_SERVER_URL` : `https://api.manus.im` ;
- `VITE_OAUTH_PORTAL_URL` : `https://manus.im` ;
- `JWT_SECRET` : valeur aléatoire longue, générée par Render ou définie comme secret.

Dans l’application OAuth, enregistrer exactement :

`https://VOTRE-DOMAINE-RENDER/api/oauth/callback`

Si un domaine personnalisé est utilisé, enregistrer aussi son callback exact.

## Validation

Avec OAuth absent, `/api/oauth/start?type=signUp` retourne maintenant HTTP 302 vers `/?auth=not-configured&action=signUp`, sans JSON brut. `pnpm check`, `pnpm test` et `pnpm build` réussissent après le correctif.
