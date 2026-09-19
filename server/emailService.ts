import nodemailer, { type SendMailOptions } from "nodemailer";
import { ENV } from "./_core/env";

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string; // Buffer or base64 string
  path?: string; // URL or file path
  contentType?: string;
}

export interface SendEmailPayload {
  to?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailProviderStatus {
  activeProvider: "resend" | "sendgrid" | "smtp" | "console_simulation";
  targetRecipient: string;
  isConfigured: boolean;
  resendConfigured: boolean;
  sendgridConfigured: boolean;
  smtpConfigured: boolean;
  notes: string[];
}

export const TARGET_ADMIN_EMAIL = ENV.adminNotificationEmail;

export function getEmailProviderStatus(): EmailProviderStatus {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
  const hasSmtp = Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.OUTLOOK_SMTP_USER && process.env.OUTLOOK_SMTP_PASS)
  );

  let activeProvider: EmailProviderStatus["activeProvider"] = "console_simulation";
  if (hasResend) activeProvider = "resend";
  else if (hasSendGrid) activeProvider = "sendgrid";
  else if (hasSmtp) activeProvider = "smtp";

  const notes: string[] = [];
  if (activeProvider === "console_simulation") {
    notes.push(
      "Mode simulation actif : les alertes et fichiers sont consignés dans les logs et le centre d'administration sans échec d'envoi. Pour activer la délivrance réelle dans Outlook, configurez RESEND_API_KEY (recommandé), SENDGRID_API_KEY ou les identifiants SMTP Outlook."
    );
  } else if (activeProvider === "resend") {
    notes.push("Fournisseur actif : Resend API. Assurez-vous d'utiliser un expéditeur (RESEND_FROM) associé à un domaine validé ou onboarding@resend.dev en test.");
  } else if (activeProvider === "sendgrid") {
    notes.push("Fournisseur actif : SendGrid API v3.");
  } else if (activeProvider === "smtp") {
    notes.push("Fournisseur actif : SMTP TLS.");
  }

  return {
    activeProvider,
    targetRecipient: TARGET_ADMIN_EMAIL,
    isConfigured: activeProvider !== "console_simulation",
    resendConfigured: hasResend,
    sendgridConfigured: hasSendGrid,
    smtpConfigured: hasSmtp,
    notes,
  };
}

async function sendViaResend(apiKey: string, payload: SendEmailPayload) {
  const from = process.env.RESEND_FROM || "ICX POWER SOLUTIONS <notifications@resend.dev>";
  const to = payload.to || TARGET_ADMIN_EMAIL;

  const resendAttachments = payload.attachments?.map((att) => {
    if (att.content instanceof Buffer) {
      return {
        filename: att.filename,
        content: att.content.toString("base64"),
      };
    }
    if (typeof att.content === "string") {
      const cleanContent = att.content.includes(",") ? att.content.split(",")[1] : att.content;
      return {
        filename: att.filename,
        content: cleanContent,
      };
    }
    if (att.path) {
      return {
        filename: att.filename,
        path: att.path,
      };
    }
    return {
      filename: att.filename,
      content: "",
    };
  });

  const body: Record<string, unknown> = {
    from,
    to: [to],
    subject: payload.subject,
    html: payload.html,
    text: payload.text || undefined,
    attachments: resendAttachments && resendAttachments.length > 0 ? resendAttachments : undefined,
  };
  if (payload.replyTo) {
    body.reply_to = payload.replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return { id: result.id, provider: "resend" };
}

async function sendViaSendGrid(apiKey: string, payload: SendEmailPayload) {
  const from = process.env.SENDGRID_FROM || process.env.EMAIL_FROM || "notifications@icx-power.com";
  const to = payload.to || TARGET_ADMIN_EMAIL;

  const attachments = payload.attachments?.map((att) => {
    let base64 = "";
    if (att.content instanceof Buffer) {
      base64 = att.content.toString("base64");
    } else if (typeof att.content === "string") {
      base64 = att.content.includes(",") ? att.content.split(",")[1] : att.content;
    }
    return {
      content: base64,
      filename: att.filename,
      type: att.contentType || "application/octet-stream",
      disposition: "attachment",
    };
  });

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: "ICX POWER SOLUTIONS" },
    subject: payload.subject,
    content: [
      { type: "text/plain", value: payload.text || "Nouvelle notification ICX" },
      { type: "text/html", value: payload.html },
    ],
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error (${response.status}): ${errorText}`);
  }

  return { id: response.headers.get("x-message-id") || "sent", provider: "sendgrid" };
}

async function sendViaSmtp(payload: SendEmailPayload) {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.OUTLOOK_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.OUTLOOK_SMTP_PASS || process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "icxps.sale@outlook.com";
  const to = payload.to || TARGET_ADMIN_EMAIL;

  if (!user || !pass) {
    throw new Error("SMTP credentials missing (SMTP_USER / SMTP_PASS or OUTLOOK_SMTP_USER / OUTLOOK_SMTP_PASS)");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });

  const mailOptions: SendMailOptions = {
    from: `"ICX POWER SOLUTIONS" <${from}>`,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
    attachments: payload.attachments?.map((att) => ({
      filename: att.filename,
      content: att.content,
      path: att.path,
      contentType: att.contentType,
    })),
  };

  const info = await transporter.sendMail(mailOptions);
  return { id: info.messageId, provider: "smtp" };
}

export async function sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; id?: string; provider: string; warning?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const hasSmtp = Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.OUTLOOK_SMTP_USER && process.env.OUTLOOK_SMTP_PASS)
  );

  try {
    if (resendApiKey) {
      const res = await sendViaResend(resendApiKey, payload);
      console.log(`[Email Service] Envoyé avec succès via Resend à ${payload.to || TARGET_ADMIN_EMAIL}: ${payload.subject}`);
      return { success: true, ...res };
    }

    if (sendgridApiKey) {
      const res = await sendViaSendGrid(sendgridApiKey, payload);
      console.log(`[Email Service] Envoyé avec succès via SendGrid à ${payload.to || TARGET_ADMIN_EMAIL}: ${payload.subject}`);
      return { success: true, ...res };
    }

    if (hasSmtp) {
      const res = await sendViaSmtp(payload);
      console.log(`[Email Service] Envoyé avec succès via SMTP à ${payload.to || TARGET_ADMIN_EMAIL}: ${payload.subject}`);
      return { success: true, ...res };
    }

    // Fallback: Simulation mode for local sandbox or before credentials are set in Render/Production
    console.info(`[Email Service - SIMULATION] Notification préparée pour ${payload.to || TARGET_ADMIN_EMAIL}`);
    console.info(`[Email Service - SIMULATION] Sujet: ${payload.subject}`);
    console.info(`[Email Service - SIMULATION] Pièces jointes: ${payload.attachments?.length ?? 0}`);
    if (payload.attachments) {
      payload.attachments.forEach((a) => console.info(`   -> Fichier joint: ${a.filename} (${a.contentType || "binary"})`));
    }

    return {
      success: true,
      id: `sim_${Date.now()}`,
      provider: "console_simulation",
      warning: "Aucun fournisseur d'e-mail n'est configuré (RESEND_API_KEY, SENDGRID_API_KEY ou SMTP). L'alerte a été consignée en toute sécurité.",
    };
  } catch (error) {
    console.error(`[Email Service] Échec d'envoi de l'e-mail (${payload.subject}):`, error);
    return {
      success: false,
      provider: "error",
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}
