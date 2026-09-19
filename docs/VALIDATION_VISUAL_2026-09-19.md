# Validation visuelle — 19 septembre 2026

La production locale a été ouverte via l’URL publique temporaire du sandbox, sur le serveur Node construit. La page d’accueil affiche les trois cartes stratégiques au-dessus du premier bloc de services.

La carte **Consulting** affiche la photographie réelle de réunion de conseil, avec un cadrage qui conserve les trois professionnels, les documents et la table de travail. La carte **Partenariats stratégiques** affiche la photographie réelle d’une signature d’accord international ; le cadrage conserve les deux signataires, la représentante et les drapeaux, puis l’intégration dorée maintient une lisibilité suffisante du texte. Les cartes restent alignées, sans rupture de mise en page, sur le viewport vérifié.

Les chemins d’images `/images/home/consulting-advisory.jpg` et `/images/home/strategic-partnerships.jpg` ont tous deux retourné HTTP 200 depuis le serveur de production.

## Interaction de chat

Le lanceur de chat s’ouvre correctement depuis l’accueil et affiche le positionnement « Réponses sourcées », son explication de fonctionnement, les suggestions thématiques et le champ de question. Une question sur le permis de travail en Roumanie a été envoyée afin de vérifier la sélection de l’autorité IGI et l’affichage des sources sous la réponse.

La réponse de repli contrôlée a été vérifiée sur la production finale via l’endpoint tRPC : pour « Quels documents dois-je vérifier pour un permis de travail en Roumanie ? », elle indique une liste de contrôles utile (catégorie, conditions employeur/demandeur, documents, voie de dépôt, frais et délais), cite `[S1]`, et expose l’Inspectoratul General pentru Imigrări ainsi que le parcours ICX. Elle n’invente aucun document ni délai. Cette réponse reste disponible même sans service de modèle configuré ; avec les variables Forge de Render, le modèle reçoit en complément le dossier de sources et les extraits actuels autorisés.
