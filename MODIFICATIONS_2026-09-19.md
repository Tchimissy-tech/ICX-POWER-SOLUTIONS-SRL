# Modifications du 19 septembre 2026

## Téléversement sécurisé

Les parcours d’études, permis de travail, immobilier, commerce, mandats, sourcing et partenariat créent désormais une demande avec une référence et un jeton privé de téléversement. Après l’envoi du formulaire, le demandeur peut choisir un type de document et transmettre un PDF, JPG ou PNG de 4 Mo maximum. Les fichiers sont contrôlés par signature binaire, stockés sous une clé privée et enregistrés avec un statut de validation en attente. Le dossier d’études authentifié conserve son téléversement existant et les demandes publiques disposent maintenant de leur propre table `serviceRequestDocuments`.

La migration `drizzle/0002_request_documents.sql` ajoute le jeton privé aux demandes et crée la table des documents. Les variables `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY` ont été ajoutées à `render.yaml` et doivent être configurées pour activer le stockage privé sur Render.

## Authentification

Les boutons « Créer un compte » et « Se connecter » utilisent le flux Manus OAuth existant avec des actions distinctes `signUp` et `signIn`. La correction définitive côté déploiement consiste à renseigner `VITE_APP_ID`, `OAUTH_SERVER_URL` et `VITE_OAUTH_PORTAL_URL` dans Render. Le projet ne crée pas de système local parallèle de mots de passe, afin de ne pas contourner le fournisseur d’identité ni stocker des identifiants sensibles sans vérification d’adresse, confirmation du gestionnaire, récupération de compte et protection anti-abus.

## Références d’enregistrement

La page d’accueil affiche désormais CUI 54675848, numéro du Registre du Commerce J2026031336000, EUID ROONRC.J2026031336000, siège Str. Hlincea nr. 47, Iași, Roumanie, date de création du 13 mai 2026 et CAEN principal 7020. Les références ont été recoupées avec les fiches publiques RisCo et ListaFirme et sont accompagnées d’un avertissement demandant une revalidation auprès de l’ONRC avant usage juridique.

## Ajout complémentaire — dépôt depuis les pages de contact

Les pages de contact « Étudier à l’étranger », « Permis de travail » et « Demande de partenariat » comportent désormais un champ de dépôt directement dans le formulaire. La sélection multiple accepte jusqu’à 20 fichiers PDF, JPG ou PNG de 4 Mo maximum par fichier. Les fichiers sélectionnés sont téléversés automatiquement après création de la demande et liés à sa référence privée ; le demandeur peut ensuite compléter le dossier depuis l’espace documentaire sécurisé.

La compilation, les contrôles TypeScript et les trois tests Vitest ont été exécutés avec succès.

## Administration, contacts et chat — 19 septembre 2026

Le tableau de bord `/admin` permet désormais au personnel ICX autorisé de consulter les comptes, dossiers d’études, demandes de services et documents reçus. Il permet de valider ou refuser les comptes, de faire évoluer les statuts des dossiers et demandes, et d’accepter ou rejeter les documents. Chaque opération passe par une procédure protégée par rôle et crée un journal d’audit. La migration `drizzle/0003_account_approval.sql` ajoute le statut de validation des comptes.

Les coordonnées publiques ont été ajoutées au pied de page : icxps.sale@outlook.com, représentant légal +40 745 437 748, responsable des opérations et de la coordination +40 753 413 765.

La page `/chat` propose une discussion d’orientation avec l’assistant IA ICX. L’assistant donne des informations générales avant le traitement humain, rappelle qu’il ne garantit ni emploi, permis, admission, prix ou partenariat, et renvoie vers les responsables pour toute décision ou validation. L’appel utilise `invokeLLM` côté serveur et exige les variables Render `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY`.

## Assistant flottant et humanisation — 19 septembre 2026

Le module de chat a été remplacé par `client/src/components/FloatingAssistant.tsx`. Il est accessible à droite sur toutes les pages publiques, sans quitter le parcours en cours. Il présente un état de disponibilité, un message d’accueil, des suggestions de sujets, une animation de réponse, l’historique de conversation, un état d’erreur explicite, une relance et un accès direct à l’équipe humaine par téléphone.

Le serveur renvoie désormais des réponses dans les cinq langues du site, avec un ton plus naturel et une prochaine étape concrète. Le comportement de secours affiche les coordonnées ICX lorsque l’API IA ne répond pas, au lieu de laisser le demandeur sans indication.

La typographie éditoriale des titres utilise désormais une police serif complémentaire. Le pied de page explique clairement qu’une première orientation automatique est suivie par une personne de l’équipe ICX pour les décisions importantes. Les routes publiques et la production ont été vérifiées après compilation.

## Repositionnement stratégique — expertise, consulting et alliances internationales

La page d’accueil positionne désormais ICX POWER SOLUTIONS SRL comme une plateforme dédiée à l’expertise internationale, au consulting, au sourcing et aux études à l’étranger, par le conseil et l’orientation.

Trois parcours visuels sont mis en avant dès l’accueil : `/expertise-internationale`, `/consulting` et `/partnerships-strategiques`. Chaque parcours possède une architecture indépendante, des onglets interactifs et des appels à l’action vers l’équipe ICX.

La page Expertise internationale structure les sujets suivants : intelligence de marché, implantation internationale, mines et ressources naturelles, partenariats stratégiques, énergie et financement. La page Consulting structure les disciplines suivantes : stratégie et marché, opérations et organisation, start-up et innovation, énergie et financement, gouvernance et coopération. La page Partenariats stratégiques couvre les secteurs miniers, les ressources naturelles, les start-up, l’énergie, l’agro-industrie, les institutions, le commerce et l’implantation, avec une couverture Europe, États-Unis et Afrique.

Les visuels utilisent les images déjà regroupées dans `client/public/images`, servies localement par Render sans dépendance à des URLs externes. Les routes ont été enregistrées dans `App.tsx` et ajoutées à la navigation principale ainsi qu’au lanceur de projet.

## Correction du chat

Le endpoint `ai.chat` traite désormais les réponses texte et les réponses multi-parties renvoyées par le modèle. Il capture les erreurs de configuration ou de disponibilité de l’API et renvoie une réponse de relais humain avec les coordonnées ICX au lieu de laisser l’utilisateur sans réponse. Le prompt couvre désormais l’expertise internationale, le consulting, les mines, les ressources naturelles, les start-up, l’énergie et le financement. La page `/chat` présente le nouveau module flottant et ne réutilise plus l’ancien écran de chat qui pouvait sembler inactif.
