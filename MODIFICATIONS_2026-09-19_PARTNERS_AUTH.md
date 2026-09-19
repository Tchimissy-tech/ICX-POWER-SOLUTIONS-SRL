# Corrections — partenaires, sources officielles et authentification

## Références et partenaires

La page Partenaires ne présente plus AAFT comme une université. Elle utilise le nom **Asociația Africanilor pentru Fericirea Tuturor (AAFT)**, la qualifie d’association et renvoie à la référence publique `aaft.ro` sur Instagram. Le lien `aaft.com`, qui décrit l’institution éducative indienne Asian Academy of Film and Television, n’est plus utilisé pour décrire l’association roumaine.

Babeș-Bolyai est affichée comme **université publique et institution de recherche**, avec sa page institutionnelle officielle. Elle est explicitement marquée « partenariat ICX non confirmé ». ONRC est affiché comme **institution publique roumaine sous l’autorité du ministère de la Justice**, utilisée pour les vérifications de registre et non comme partenaire. LORONDO reste une référence publique et non une preuve automatique de partenariat.

Le sous-onglet de la page Étudier à l’étranger qui concernait AAFT ne renvoie plus vers une page d’admission universitaire. Il ouvre désormais la référence associative publique et porte la mention « association reference » en anglais.

Le registre du chat a été aligné sur ces statuts : AAFT, Babeș-Bolyai et ONRC sont cités comme références officielles ou institutionnelles, sans jamais être présentés comme partenaires ICX confirmés.

## Création de compte et connexion

Les boutons « Créer un compte » et « Se connecter » utilisent maintenant `/api/oauth/start?type=signUp` et `/api/oauth/start?type=signIn`. Le serveur construit l’URL de retour avec le domaine public réel, conserve l’identifiant OAuth côté serveur, crée le nonce dans un cookie sécurisé adapté à HTTPS/Render et accepte un cookie de repli pour les environnements HTTP locaux. Le callback vérifie le nonce, nettoie les deux variantes de cookie et crée la session après échange du code.

Cette architecture évite les échecs causés par une variable Vite absente du navigateur ou par la détection incorrecte du protocole derrière le proxy Render. La configuration de production doit contenir `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` et `JWT_SECRET`, et l’URL `/api/oauth/callback` doit être enregistrée dans l’application OAuth.

## Validation

`pnpm check`, `pnpm test` et `pnpm build` réussissent. Les tests comptent 8 assertions réparties dans 3 fichiers. Le smoke test de production retourne HTTP 200 pour `/partners` et `/study`; l’initiation OAuth retourne HTTP 302, une URL `https://manus.im/app-auth`, le callback Render attendu et un cookie `__Host-oauth_state` sécurisé avec `SameSite=Lax`.
