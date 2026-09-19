# Correctifs — visuels d’accueil et assistant sourcé

## Visuels d’accueil

Les cartes **Consulting** et **Partenariats stratégiques** de l’accueil utilisent maintenant deux photographies professionnelles réelles, stockées dans `client/public/images/home/` et donc servies localement dans le build Vite/Render. La première illustre une réunion de conseil et la seconde une signature d’accord international. Les textes alternatifs ont été précisés et le cadrage a été adapté aux cartes.

La provenance est consignée dans `client/public/images/README.md` et `docs/ASSET_RESEARCH_NOTES.md`. Aucune image n’est chargée depuis un fournisseur externe en production.

## Assistant précis et sourcé

L’endpoint `ai.chat` n’envoie plus la conversation au modèle avec un simple prompt générique. Il sélectionne désormais un petit dossier de sources pertinentes, écrit et contrôlé dans `server/chatKnowledge.ts`. Ce dossier comprend les parcours ICX, les autorités officielles pour la Roumanie et la Pologne, l’ONRC, les institutions universitaires référencées et les sites des organisations partenaires citées.

L’assistant reçoit des règles explicites : il répond directement à partir des sources disponibles, cite les identifiants `[S1]`, `[S2]`, `[S3]`, ne présente jamais un lien de référence comme un partenariat confirmé et n’invente ni délai, ni frais, ni condition, ni procédure. Les réponses affichent immédiatement les liens correspondants dans le lanceur de chat.

Pour les sources externes approuvées, le serveur peut lire un court extrait de la page actuelle, dans une liste strictement autorisée, avec délai de 3,5 secondes et cache de quatre heures. Les données de l’utilisateur ne sont jamais envoyées aux sites externes. En cas d’indisponibilité du modèle ou d’une page externe, une réponse sourcée de repli reste disponible. Les appels au modèle ont un délai de 15 secondes et un seul nouvel essai afin de rester réactifs sur Render.

## Compatibilité Render

Aucune variable de configuration nouvelle n’est requise. Le dispositif continue d’utiliser uniquement `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY` pour le modèle, déjà déclarées dans `render.yaml`. Les images sont incluses dans le bundle, et la récupération des sources s’exécute côté serveur avec les API Web natives de Node 22.
