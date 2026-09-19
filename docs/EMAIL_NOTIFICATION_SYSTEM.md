# Intégration du Fournisseur d'E-mail et Traitement Opérationnel ICX

Ce document détaille l'architecture mise en place pour acheminer l'ensemble des interactions, demandes, créations de compte et fichiers téléversés vers l'adresse centrale :
**`icxps.sale@outlook.com`**.

---

## 1. Vue d'ensemble de l'architecture

Le système est conçu avec un **moteur de notification multi-fournisseurs** (`server/emailService.ts`) et un **générateur de templates e-mail responsives** (`server/emailTemplates.ts`).

### Événements raccordés aux notifications e-mail :
1. **Création d'un compte utilisateur** :
   - Déclenchée lors de la première connexion / inscription (OAuth).
   - E-mail envoyé immédiatement à `icxps.sale@outlook.com` avec :
     - Les détails du compte (nom, e-mail, méthode d'authentification, date).
     - **Bouton 1 clic : APPROUVER LE COMPTE** (`/api/actions/decide?token=...`).
     - **Bouton 1 clic : REFUSER LE COMPTE** (`/api/actions/decide?token=...`).
     - Lien direct vers le centre d'administration du site.
2. **Demandes de services et interactions** :
   - Formulaires d'orientation d'études (`/services/study`, `/study/contact`).
   - Demandes de mobilité professionnelle Roumanie / Pologne (`/work-permits/contact`).
   - Demandes de partenariats commerciaux ou institutionnels (`/partnership`).
   - Demandes de sourcing international (`/sourcing`).
   - Demandes d'opportunités immobilières (`/services/real-estate`).
   - Demandes commerciales et mandats de projets (`/services/commerce`, `/services/mandates`).
   - Chaque formulaire génère un e-mail détaillé contenant l'ensemble des champs saisis par le demandeur, avec possibilité de lui répondre directement en 1 clic via `Reply-To`.
3. **Téléversement de fichiers et dossiers complets** :
   - Fichiers joints aux demandes de contact / sourcing / partenariat (passeport, CV, diplôme, présentation d'entreprise, etc.).
   - Fichiers téléversés dans l'espace candidat sécurisé (`/dossier`).
   - **Transmission du fichier en pièce jointe réelle** dans l'e-mail reçu par `icxps.sale@outlook.com` (formats PDF, JPEG, PNG jusqu'aux limites e-mail).
   - **Lien de téléchargement sécurisé direct** généré via stockage objet privé et traçabilité en base de données.
4. **Gestion et pilotage dans l'espace Administration (`/admin`)** :
   - Validation manuelle d'un compte (`approved`, `rejected`, `pending`).
   - Visualisation de tous les fichiers téléversés avec bouton d'ouverture immédiate.
   - Changement de statut des demandes (`received` -> `analysis` -> `in_progress` -> `waiting` -> `closed`).
   - Bouton de test d'envoi en direct vers `icxps.sale@outlook.com` pour contrôler la délivrance.

---

## 2. Configuration des fournisseurs d'e-mail pris en charge

Le code inspecte dynamiquement vos variables d'environnement selon la priorité suivante :

### Option A : Resend (Recommandé pour la rapidité et la délivrabilité)
- **Variable requise** : `RESEND_API_KEY=re_xxxxxxxx`
- **Expéditeur** : `RESEND_FROM="ICX POWER SOLUTIONS <notifications@votre-domaine.com>"` (ou `onboarding@resend.dev` en phase de test avant validation de domaine).
- **Atouts** : Gestion native des pièces jointes jusqu'à 40 Mo, excellente délivrabilité vers les boîtes Outlook / Microsoft 365.

### Option B : SMTP Outlook direct (Sans intermédiaire)
- **Variables requises** :
  - `OUTLOOK_SMTP_USER=icxps.sale@outlook.com`
  - `OUTLOOK_SMTP_PASS=votre_mot_de_passe_ou_mot_de_passe_d_application`
  - `SMTP_HOST=smtp.office365.com` (ou `smtp-mail.outlook.com`)
  - `SMTP_PORT=587`
- **Atouts** : Envoi direct depuis votre propre messagerie Microsoft Outlook sans abonnement tiers.

### Option C : SendGrid
- **Variable requise** : `SENDGRID_API_KEY=SG.xxxxxxxx`
- **Expéditeur** : `SENDGRID_FROM=notifications@votre-domaine.com`

### Mode de secours (Simulation sécurisée)
En local ou si aucune clé n'est encore configurée, les notifications et pièces jointes sont tracées dans les logs de la plateforme et dans le tableau de bord `/admin` sans provoquer d'erreur utilisateur.

---

## 3. Exemple de fichier d'environnement (`.env`)

```env
# Destinataire central des alertes
ADMIN_NOTIFICATION_EMAIL=icxps.sale@outlook.com

# URL publique du site (pour générer les liens d'approbation et d'administration)
APP_BASE_URL=https://votre-site.com

# --- Choix 1 : Resend (Recommandé) ---
RESEND_API_KEY=re_123456789
RESEND_FROM=ICX POWER SOLUTIONS <notifications@resend.dev>

# --- Choix 2 : SMTP Outlook ---
# OUTLOOK_SMTP_USER=icxps.sale@outlook.com
# OUTLOOK_SMTP_PASS=mot_de_passe_application_outlook
# SMTP_HOST=smtp.office365.com
# SMTP_PORT=587

# --- Choix 3 : SendGrid ---
# SENDGRID_API_KEY=SG.123456789
# SENDGRID_FROM=notifications@icx-power.com
```

---

## 4. Flux de traitement d'un compte et d'un dossier

```
[Visiteur crée un compte]
       │
       ▼
[Enregistrement en base de données avec statut 'pending']
       │
       ▼
[Génération de jetons sécurisés temporaires (approbation / refus)]
       │
       ▼
[Envoi e-mail immédiat à icxps.sale@outlook.com]
       ├──> Clic sur "APPROUVER LE COMPTE"  ──> Compte activé immédiatement
       ├──> Clic sur "REFUSER LE COMPTE"    ──> Compte rejeté immédiatement
       └──> Clic sur "Ouvrir l'Admin"       ──> Traitement global sur le site
```

```
[Visiteur soumet une demande ou téléverse des fichiers]
       │
       ▼
[Stockage sécurisé dans le bucket privé et métadonnées en base]
       │
       ▼
[Envoi e-mail immédiat à icxps.sale@outlook.com]
       ├──> Détails complets de la demande en HTML
       ├──> Fichiers joints réels (PDF / JPG / PNG)
       ├──> Lien sécurisé de téléchargement
       └──> Clic sur "Répondre" ouvre la rédaction Outlook vers le demandeur
```
