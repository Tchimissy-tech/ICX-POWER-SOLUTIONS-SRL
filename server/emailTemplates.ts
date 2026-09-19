export interface AccountCreatedNotificationData {
  userId: number;
  userName: string | null;
  userEmail: string | null;
  loginMethod: string | null;
  createdAt: Date;
  approveUrl: string;
  rejectUrl: string;
  adminDashboardUrl: string;
}

export interface ServiceRequestNotificationData {
  reference: string;
  type: string;
  requesterName: string;
  email: string;
  organization?: string | null;
  country?: string | null;
  payload: Record<string, unknown>;
  createdAt: Date;
  adminDashboardUrl: string;
  filesCount?: number;
}

export interface DocumentUploadedNotificationData {
  contextType: "service_request" | "application";
  reference: string;
  documentType: string;
  originalName: string;
  byteSize: number;
  mimeType: string;
  uploaderInfo: string;
  fileDownloadUrl?: string;
  adminDashboardUrl: string;
}

function baseLayout(title: string, badge: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f5f7; margin: 0; padding: 24px; color: #102337; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #07131f; padding: 28px 32px; color: #ffffff; }
    .eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: #e5bd69; text-transform: uppercase; margin: 0 0 6px 0; }
    .title { font-size: 22px; font-weight: 700; margin: 0; color: #ffffff; line-height: 1.3; }
    .content { padding: 32px; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 20px; background: #e6ece8; color: #426052; margin-bottom: 16px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
    .card-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #64748b; }
    .value { font-weight: 600; color: #0f172a; text-align: right; }
    .btn-group { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 12px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; text-align: center; }
    .btn-approve { background: #15803d; color: #ffffff !important; }
    .btn-reject { background: #b91c1c; color: #ffffff !important; }
    .btn-primary { background: #d8a94a; color: #07131f !important; }
    .btn-secondary { background: #0f172a; color: #ffffff !important; }
    .footer { background: #f8fafc; padding: 20px 32px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.6; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="eyebrow">ICX POWER SOLUTIONS SRL · CENTRE DE NOTIFICATION</p>
      <h1 class="title">${title}</h1>
    </div>
    <div class="content">
      <span class="badge">${badge}</span>
      ${contentHtml}
    </div>
    <div class="footer">
      Notification opérationnelle automatique destinée à <strong>icxps.sale@outlook.com</strong>.<br>
      Plateforme ICX POWER SOLUTIONS SRL · Iași, Roumanie.
    </div>
  </div>
</body>
</html>`;
}

export function renderAccountCreatedEmail(data: AccountCreatedNotificationData): { subject: string; html: string; text: string } {
  const subject = `[ICX ALERTE] Nouveau compte créé - ${data.userName || data.userEmail || "Utilisateur #" + data.userId} (Approbation requise)`;

  const html = baseLayout(
    "Nouveau compte utilisateur à approuver",
    "CRÉATION DE COMPTE",
    `
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Un nouvel utilisateur vient de créer un profil sur la plateforme ICX POWER SOLUTIONS. Par mesure de conformité et de contrôle, son compte est en attente d'approbation.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="label">ID Utilisateur :</span>
          <span class="value">#${data.userId}</span>
        </div>
        <div class="card-row">
          <span class="label">Nom complet :</span>
          <span class="value">${data.userName || "Non renseigné"}</span>
        </div>
        <div class="card-row">
          <span class="label">Adresse e-mail :</span>
          <span class="value">${data.userEmail || "Non renseignée"}</span>
        </div>
        <div class="card-row">
          <span class="label">Méthode de connexion :</span>
          <span class="value">${data.loginMethod || "OAuth"}</span>
        </div>
        <div class="card-row">
          <span class="label">Date d'inscription :</span>
          <span class="value">${data.createdAt.toLocaleString("fr-FR", { timeZone: "UTC" })} UTC</span>
        </div>
      </div>

      <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 20px;">
        Action rapide en un clic depuis votre messagerie Outlook :
      </p>

      <div class="btn-group">
        <a href="${data.approveUrl}" class="btn btn-approve">✔ APPROUVER LE COMPTE</a>
        <a href="${data.rejectUrl}" class="btn btn-reject">✖ REFUSER LE COMPTE</a>
        <a href="${data.adminDashboardUrl}" class="btn btn-secondary">Ouvrir le tableau de bord</a>
      </div>

      <p style="font-size: 11px; color: #64748b; margin-top: 18px;">
        Ces liens sécurisés permettent de traiter immédiatement la demande. Vous pouvez également ajuster le statut depuis l'onglet « Administration » du site.
      </p>
    `
  );

  const text = `NOUVEAU COMPTE CRÉÉ SUR LE SITE ICX\n\n` +
    `ID: #${data.userId}\n` +
    `Nom: ${data.userName || "Non renseigné"}\n` +
    `Email: ${data.userEmail || "Non renseignée"}\n` +
    `Méthode: ${data.loginMethod || "OAuth"}\n\n` +
    `Approuver directement: ${data.approveUrl}\n` +
    `Refuser le compte: ${data.rejectUrl}\n` +
    `Tableau de bord: ${data.adminDashboardUrl}\n`;

  return { subject, html, text };
}

export function renderServiceRequestEmail(data: ServiceRequestNotificationData): { subject: string; html: string; text: string } {
  const typeLabelMap: Record<string, string> = {
    sourcing: "Sourcing & Approvisionnement",
    partnership: "Partenariat Institutionnel / Commercial",
    contact: "Contact & Orientation Études / Travail",
    property: "Opportunités Immobilières",
    appointment: "Prise de rendez-vous",
  };

  const subject = `[ICX DEMANDE] ${typeLabelMap[data.type] || data.type} - Réf. ${data.reference} (${data.requesterName})`;

  const payloadRows = Object.entries(data.payload || {})
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const formattedVal = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `<div class="card-row"><span class="label">${k} :</span><span class="value">${formattedVal}</span></div>`;
    })
    .join("");

  const html = baseLayout(
    `Nouvelle demande reçue : ${data.reference}`,
    (typeLabelMap[data.type] || data.type).toUpperCase(),
    `
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Une nouvelle interaction a été soumise sur le site par <strong>${data.requesterName}</strong>.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="label">Référence :</span>
          <span class="value" style="color: #b88429;">${data.reference}</span>
        </div>
        <div class="card-row">
          <span class="label">Type de demande :</span>
          <span class="value">${typeLabelMap[data.type] || data.type}</span>
        </div>
        <div class="card-row">
          <span class="label">Demandeur :</span>
          <span class="value">${data.requesterName}</span>
        </div>
        <div class="card-row">
          <span class="label">E-mail de contact :</span>
          <span class="value">${data.email}</span>
        </div>
        ${data.organization ? `<div class="card-row"><span class="label">Organisation :</span><span class="value">${data.organization}</span></div>` : ""}
        ${data.country ? `<div class="card-row"><span class="label">Pays / Destination :</span><span class="value">${data.country}</span></div>` : ""}
        <div class="card-row">
          <span class="label">Fichiers joints initiaux :</span>
          <span class="value">${data.filesCount ? `${data.filesCount} fichier(s) ci-joint(s)` : "Aucun fichier initial"}</span>
        </div>
      </div>

      <h3 style="font-size: 14px; margin: 24px 0 10px 0; color: #0f172a;">Détails saisis par le demandeur :</h3>
      <div class="card" style="margin-top: 8px;">
        ${payloadRows || '<p style="font-size: 12px; color: #64748b; margin: 0;">Aucun paramètre supplémentaire renseigné.</p>'}
      </div>

      <div class="btn-group">
        <a href="${data.adminDashboardUrl}" class="btn btn-primary">Traiter cette demande dans l'espace Admin</a>
        <a href="mailto:${data.email}?subject=ICX%20POWER%20SOLUTIONS%20-%20Votre%20demande%20${data.reference}" class="btn btn-secondary">Répondre au demandeur</a>
      </div>
    `
  );

  const text = `NOUVELLE DEMANDE REÇUE - RÉF. ${data.reference}\n\n` +
    `Type: ${typeLabelMap[data.type] || data.type}\n` +
    `Demandeur: ${data.requesterName}\n` +
    `Email: ${data.email}\n` +
    `Organisation: ${data.organization || "N/A"}\n` +
    `Pays: ${data.country || "N/A"}\n\n` +
    `Traiter sur le site: ${data.adminDashboardUrl}\n`;

  return { subject, html, text };
}

export function renderDocumentUploadedEmail(data: DocumentUploadedNotificationData): { subject: string; html: string; text: string } {
  const sizeMb = (data.byteSize / (1024 * 1024)).toFixed(2);
  const subject = `[ICX FICHIER] Nouveau document téléversé - ${data.originalName} (${data.reference})`;

  const html = baseLayout(
    "Nouveau document / dossier téléversé",
    "TÉLÉVERSEMENT DE FICHIER",
    `
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Un fichier vient d'être téléversé sur le site pour le dossier <strong>${data.reference}</strong>.
        Le fichier est joint directement à cet e-mail lorsqu'il respecte les limites de messagerie, et archivé en stockage privé sécurisé.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="label">Nom du fichier :</span>
          <span class="value">${data.originalName}</span>
        </div>
        <div class="card-row">
          <span class="label">Type de document :</span>
          <span class="value">${data.documentType}</span>
        </div>
        <div class="card-row">
          <span class="label">Taille :</span>
          <span class="value">${sizeMb} Mo (${data.byteSize} octets)</span>
        </div>
        <div class="card-row">
          <span class="label">Format MIME :</span>
          <span class="value">${data.mimeType}</span>
        </div>
        <div class="card-row">
          <span class="label">Dossier / Réf :</span>
          <span class="value" style="color: #b88429;">${data.reference}</span>
        </div>
        <div class="card-row">
          <span class="label">Téléversé par :</span>
          <span class="value">${data.uploaderInfo}</span>
        </div>
      </div>

      <div class="btn-group">
        ${data.fileDownloadUrl ? `<a href="${data.fileDownloadUrl}" class="btn btn-primary">Télécharger / Visualiser le document</a>` : ""}
        <a href="${data.adminDashboardUrl}" class="btn btn-secondary">Ouvrir le centre de contrôle</a>
      </div>
    `
  );

  const text = `NOUVEAU DOCUMENT TÉLÉVERSÉ SUR ICX\n\n` +
    `Fichier: ${data.originalName}\n` +
    `Type: ${data.documentType}\n` +
    `Taille: ${sizeMb} Mo\n` +
    `Dossier: ${data.reference}\n` +
    `Téléversé par: ${data.uploaderInfo}\n\n` +
    `Accéder au centre admin: ${data.adminDashboardUrl}\n`;

  return { subject, html, text };
}
