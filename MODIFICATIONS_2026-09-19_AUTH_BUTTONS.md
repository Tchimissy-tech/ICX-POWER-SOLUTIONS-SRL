# Correctif — boutons de compte

Les boutons publics du site ont été clarifiés et limités à deux parcours :

- **Créer un compte** : destiné à un nouvel utilisateur qui ne possède pas encore de compte ; l’action envoie `type=signUp`.
- **Connexion** : destinée à un utilisateur qui possède déjà un compte ; l’action envoie `type=signIn`.

Les deux boutons possèdent désormais un libellé explicite, un titre et une description d’accessibilité. Le menu mobile et l’en-tête desktop utilisent les mêmes actions. Aucun libellé de restauration, récupération ou réinitialisation de compte n’est présent dans le code de l’interface ICX.

Le projet ne crée pas de système local parallèle d’authentification : la création et la connexion restent gérées par le fournisseur OAuth configuré dans Render.
