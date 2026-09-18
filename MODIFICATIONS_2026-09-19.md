# Modifications du 19 septembre 2026

## Téléversement sécurisé

Les parcours d’études, permis de travail, immobilier, commerce, mandats, sourcing et partenariat créent désormais une demande avec une référence et un jeton privé de téléversement. Après l’envoi du formulaire, le demandeur peut choisir un type de document et transmettre un PDF, JPG ou PNG de 4 Mo maximum. Les fichiers sont contrôlés par signature binaire, stockés sous une clé privée et enregistrés avec un statut de validation en attente. Le dossier d’études authentifié conserve son téléversement existant et les demandes publiques disposent maintenant de leur propre table `serviceRequestDocuments`.

La migration `drizzle/0002_request_documents.sql` ajoute le jeton privé aux demandes et crée la table des documents. Les variables `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY` ont été ajoutées à `render.yaml` et doivent être configurées pour activer le stockage privé sur Render.

## Authentification

Les boutons « Créer un compte » et « Se connecter » utilisent le flux Manus OAuth existant avec des actions distinctes `signUp` et `signIn`. La correction définitive côté déploiement consiste à renseigner `VITE_APP_ID`, `OAUTH_SERVER_URL` et `VITE_OAUTH_PORTAL_URL` dans Render. Le projet ne crée pas de système local parallèle de mots de passe, afin de ne pas contourner le fournisseur d’identité ni stocker des identifiants sensibles sans vérification d’adresse, confirmation du gestionnaire, récupération de compte et protection anti-abus.

## Références d’enregistrement

La page d’accueil affiche désormais CUI 54675848, numéro du Registre du Commerce J2026031336000, EUID ROONRC.J2026031336000, siège Str. Hlincea nr. 47, Iași, Roumanie, date de création du 13 mai 2026 et CAEN principal 7020. Les références ont été recoupées avec les fiches publiques RisCo et ListaFirme et sont accompagnées d’un avertissement demandant une revalidation auprès de l’ONRC avant usage juridique.
