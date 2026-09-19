import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { applicationStatuses, documentTypes, requestTypes, userRoles } from "../drizzle/schema";
import {
  addApplicationDocument,
  addServiceRequestDocument,
  consumeActionToken,
  createActionToken,
  createApplication,
  createServiceRequest,
  getAdminDocument,
  getAdminMetrics,
  getApplicationByReference,
  getApplicationForUser,
  getInstitutionBySlug,
  getServiceRequestById,
  getServiceRequestByReference,
  getUserById,
  listAdminApplications,
  listAdminDocuments,
  listApplicationsForUser,
  listDocumentsForApplication,
  listDocumentsForServiceRequest,
  listInstitutions,
  listServiceRequests,
  listUsersForAdmin,
  updateApplicationStatus,
  updateServiceRequestDocumentStatus,
  updateServiceRequestStatus,
  updateUserAccountStatus,
} from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storageGetSignedUrl, storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import {
  chatSourcePolicy,
  formatLiveSourcesForPrompt,
  formatSourcesForPrompt,
  localizedSourceFallback,
  publicSources,
  selectChatSources,
} from "./chatKnowledge";
import { getEmailProviderStatus, sendEmail, TARGET_ADMIN_EMAIL } from "./emailService";
import {
  renderAccountCreatedEmail,
  renderDocumentUploadedEmail,
  renderServiceRequestEmail,
} from "./emailTemplates";

const staffRoles = new Set((userRoles as readonly string[]).filter((role) => role !== "user"));
const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!staffRoles.has(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff access required" });
  }
  return next({ ctx });
});

const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const isConfirmedIdentity =
    ctx.user.email?.trim().toLowerCase() === TARGET_ADMIN_EMAIL.trim().toLowerCase();
  if (ctx.user.role !== "super_admin" || !isConfirmedIdentity || ctx.user.accountStatus !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super-administrator access required" });
  }
  return next({ ctx });
});

const uploadSchema = z.object({
  reference: z.string().regex(/^ICX-\d{4}-[A-Z0-9-]+$/),
  documentType: z.enum(documentTypes),
  fileName: z.string().min(1).max(180),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  base64Content: z.string().min(1),
});

function validateFile(bytes: Buffer, mimeType: string) {
  if (bytes.byteLength > 4 * 1024 * 1024) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Maximum file size is 4 MB" });
  }
  const isPdf = bytes.subarray(0, 4).toString("ascii") === "%PDF";
  const isJpeg = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const valid =
    (mimeType === "application/pdf" && isPdf) ||
    (mimeType === "image/jpeg" && isJpeg) ||
    (mimeType === "image/png" && isPng);
  if (!valid) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "File signature does not match its declared format" });
  }
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 180);
}

function formOperationError(error: unknown, operation: "submit" | "upload") {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Database unavailable")) {
    return new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Le stockage des données n’est pas configuré sur le serveur. Vérifiez DATABASE_URL.",
    });
  }
  if (
    message.includes("Storage config missing") ||
    message.includes("Storage presign") ||
    message.includes("Storage upload")
  ) {
    return new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Le stockage sécurisé des fichiers n’est pas configuré sur le serveur.",
    });
  }
  console.error(`[Forms] ${operation} failed`, error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      operation === "submit"
        ? "La demande n’a pas pu être enregistrée. Réessayez dans quelques instants."
        : "Le fichier n’a pas pu être téléversé. Vérifiez le fichier et réessayez.",
  });
}

function createReference(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function getBaseAppUrl(req?: any): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/+$/, "");
  if (req) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    if (host) return `${proto}://${host}`;
  }
  return "https://icx-power-solutions.com";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  institution: router({
    list: publicProcedure
      .input(z.object({ query: z.string().max(80).optional(), country: z.string().max(120).optional() }).optional())
      .query(({ input }) => listInstitutions(input ?? {})),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1).max(180) }))
      .query(({ input }) => getInstitutionBySlug(input.slug)),
  }),
  application: router({
    mine: protectedProcedure.query(({ ctx }) => listApplicationsForUser(ctx.user.id)),
    create: protectedProcedure
      .input(
        z.object({
          destination: z.string().min(2).max(120),
          studyLevel: z.string().min(2).max(80),
          field: z.string().min(2).max(160),
          budgetRange: z.string().max(80).optional(),
          preferredLanguage: z.string().max(80).optional(),
          institutionId: z.number().int().positive().optional(),
          programmeId: z.number().int().positive().optional(),
          applicantNote: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const created = await createApplication(ctx.user.id, { ...input, status: "DRAFT" });

        // Email notification for study dossier creation
        try {
          const baseUrl = getBaseAppUrl(ctx.req);
          const emailData = renderServiceRequestEmail({
            reference: created.reference,
            type: "contact",
            requesterName: ctx.user.name || "Candidat",
            email: ctx.user.email || "Non communiqué",
            country: input.destination,
            payload: {
              destination: input.destination,
              studyLevel: input.studyLevel,
              field: input.field,
              budgetRange: input.budgetRange || "N/A",
              applicantNote: input.applicantNote || "N/A",
            },
            createdAt: new Date(),
            adminDashboardUrl: `${baseUrl}/admin`,
          });
          await sendEmail({
            subject: `[ICX ÉTUDES] Nouveau dossier candidat - ${created.reference} (${ctx.user.name || "Candidat"})`,
            html: emailData.html,
            text: emailData.text,
          });
        } catch (e) {
          console.warn("[Notification] Dossier notification non bloquante échouée:", e);
        }

        return created;
      }),
    documents: protectedProcedure
      .input(z.object({ reference: z.string().regex(/^ICX-\d{4}-[A-Z0-9-]+$/) }))
      .query(async ({ ctx, input }) => {
        const application = await getApplicationForUser(ctx.user.id, input.reference);
        if (!application) throw new TRPCError({ code: "NOT_FOUND" });
        return listDocumentsForApplication(application.id, ctx.user.id);
      }),
    uploadDocument: protectedProcedure.input(uploadSchema).mutation(async ({ ctx, input }) => {
      const application = await getApplicationForUser(ctx.user.id, input.reference);
      if (!application) throw new TRPCError({ code: "NOT_FOUND" });
      const raw = input.base64Content.includes(",") ? input.base64Content.split(",")[1] : input.base64Content;
      const bytes = Buffer.from(raw, "base64");
      validateFile(bytes, input.mimeType);
      const safeName = cleanFilename(input.fileName);
      const key = `icx/private/${ctx.user.id}/${application.id}/${crypto.randomUUID()}-${safeName}`;
      const stored = await storagePut(key, bytes, input.mimeType);
      await addApplicationDocument({
        applicationId: application.id,
        ownerId: ctx.user.id,
        documentType: input.documentType,
        fileKey: stored.key,
        originalName: safeName,
        mimeType: input.mimeType,
        byteSize: bytes.byteLength,
      });

      // Send document to admin email with file attachment!
      try {
        const baseUrl = getBaseAppUrl(ctx.req);
        let signedUrl: string | undefined;
        try {
          signedUrl = await storageGetSignedUrl(stored.key);
        } catch {}

        const emailData = renderDocumentUploadedEmail({
          contextType: "application",
          reference: application.reference,
          documentType: input.documentType,
          originalName: safeName,
          byteSize: bytes.byteLength,
          mimeType: input.mimeType,
          uploaderInfo: `${ctx.user.name || "Candidat"} (${ctx.user.email || "ID #" + ctx.user.id})`,
          fileDownloadUrl: signedUrl,
          adminDashboardUrl: `${baseUrl}/admin`,
        });

        await sendEmail({
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          attachments: [
            {
              filename: safeName,
              content: bytes,
              contentType: input.mimeType,
            },
          ],
        });
      } catch (e) {
        console.warn("[Notification] Document notification non bloquante:", e);
      }

      return { success: true };
    }),
  }),
  request: router({
    submit: publicProcedure
      .input(
        z.object({
          type: z.enum(requestTypes),
          requesterName: z.string().trim().min(2).max(180),
          email: z.string().trim().email().max(320),
          organization: z.string().trim().max(180).optional(),
          country: z.string().trim().max(120).optional(),
          payload: z.record(z.string(), z.unknown()),
          website: z.string().max(0).optional(), // honeypot
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (input.website) throw new TRPCError({ code: "BAD_REQUEST" });
        const { website: _website, ...request } = input;
        const uploadToken = crypto.randomUUID() + crypto.randomUUID();
        try {
          const created = await createServiceRequest({
            ...request,
            uploadToken,
            reference: createReference("REQ"),
            status: "received",
          });

          // Dispatche un e-mail avec tous les détails à icxps.sale@outlook.com
          try {
            const baseUrl = getBaseAppUrl(ctx.req);
            const emailContent = renderServiceRequestEmail({
              reference: created.reference,
              type: request.type,
              requesterName: request.requesterName,
              email: request.email,
              organization: request.organization,
              country: request.country,
              payload: request.payload,
              createdAt: new Date(),
              adminDashboardUrl: `${baseUrl}/admin`,
            });

            await sendEmail({
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
              replyTo: request.email,
            });
          } catch (notifErr) {
            console.error("[Email] Erreur envoi alerte de demande :", notifErr);
          }

          return { ...created, uploadToken };
        } catch (error) {
          throw formOperationError(error, "submit");
        }
      }),
    documents: publicProcedure
      .input(z.object({ reference: z.string().regex(/^REQ-\d{4}-[A-Z0-9-]+$/), uploadToken: z.string().min(32).max(96) }))
      .query(async ({ input }) => {
        const request = await getServiceRequestByReference(input.reference, input.uploadToken);
        if (!request) throw new TRPCError({ code: "NOT_FOUND" });
        return listDocumentsForServiceRequest(request.id, input.uploadToken);
      }),
    uploadDocument: publicProcedure
      .input(
        uploadSchema.extend({
          reference: z.string().regex(/^REQ-\d{4}-[A-Z0-9-]+$/),
          uploadToken: z.string().min(32).max(96),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const request = await getServiceRequestByReference(input.reference, input.uploadToken);
        if (!request) throw new TRPCError({ code: "NOT_FOUND" });
        const raw = input.base64Content.includes(",") ? input.base64Content.split(",")[1] : input.base64Content;
        const bytes = Buffer.from(raw, "base64");
        validateFile(bytes, input.mimeType);
        const safeName = cleanFilename(input.fileName);
        try {
          const stored = await storagePut(
            `icx/private/requests/${request.id}/${crypto.randomUUID()}-${safeName}`,
            bytes,
            input.mimeType
          );
          await addServiceRequestDocument({
            requestId: request.id,
            uploadToken: input.uploadToken,
            documentType: input.documentType,
            fileKey: stored.key,
            originalName: safeName,
            mimeType: input.mimeType,
            byteSize: bytes.byteLength,
          });

          // Transmet le document téléversé en pièce jointe réelle à icxps.sale@outlook.com
          try {
            const baseUrl = getBaseAppUrl(ctx.req);
            let downloadUrl: string | undefined;
            try {
              downloadUrl = await storageGetSignedUrl(stored.key);
            } catch {}

            const emailData = renderDocumentUploadedEmail({
              contextType: "service_request",
              reference: request.reference,
              documentType: input.documentType,
              originalName: safeName,
              byteSize: bytes.byteLength,
              mimeType: input.mimeType,
              uploaderInfo: `${request.requesterName} (${request.email})`,
              fileDownloadUrl: downloadUrl,
              adminDashboardUrl: `${baseUrl}/admin`,
            });

            await sendEmail({
              subject: emailData.subject,
              html: emailData.html,
              text: emailData.text,
              attachments: [
                {
                  filename: safeName,
                  content: bytes,
                  contentType: input.mimeType,
                },
              ],
            });
          } catch (notifErr) {
            console.error("[Email] Erreur transmission pièce jointe par e-mail :", notifErr);
          }

          return { success: true };
        } catch (error) {
          throw formOperationError(error, "upload");
        }
      }),
  }),
  admin: router({
    providerStatus: superAdminProcedure.query(() => getEmailProviderStatus()),
    testNotification: superAdminProcedure.mutation(async ({ ctx }) => {
      const baseUrl = getBaseAppUrl(ctx.req);
      const testResult = await sendEmail({
        subject: `[ICX TEST] Validation du fournisseur d'e-mail - ${new Date().toISOString()}`,
        html: `<p>Test d'envoi réussi vers <strong>${TARGET_ADMIN_EMAIL}</strong> depuis le centre d'administration ICX.</p><p><a href="${baseUrl}/admin">Accéder à l'administration</a></p>`,
        text: `Test d'envoi réussi vers ${TARGET_ADMIN_EMAIL} depuis l'administration ICX.`,
      });
      return testResult;
    }),
    metrics: staffProcedure.query(() => getAdminMetrics()),
    requests: staffProcedure.query(() => listServiceRequests()),
    users: staffProcedure.query(() => listUsersForAdmin()),
    applications: staffProcedure.query(() => listAdminApplications()),
    documents: staffProcedure.query(() => listAdminDocuments()),
    updateUserStatus: staffProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          accountStatus: z.enum(["pending", "approved", "rejected"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await updateUserAccountStatus(input.id, input.accountStatus, ctx.user.id);
        return { success: true, user };
      }),
    updateRequestStatus: staffProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["received", "analysis", "in_progress", "waiting", "closed"]),
        })
      )
      .mutation(({ ctx, input }) => updateServiceRequestStatus(input.id, input.status, ctx.user.id)),
    documentUrl: staffProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const document = await getAdminDocument(input.id);
        if (!document) throw new TRPCError({ code: "NOT_FOUND" });
        return { url: await storageGetSignedUrl(document.fileKey) };
      }),
    updateDocumentStatus: staffProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          validationStatus: z.enum(["pending", "accepted", "rejected"]),
        })
      )
      .mutation(({ ctx, input }) =>
        updateServiceRequestDocumentStatus(input.id, input.validationStatus, ctx.user.id)
      ),
    updateApplicationStatus: staffProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum([
            "DRAFT",
            "RECEIVED",
            "VERIFICATION",
            "MISSING_DOCUMENTS",
            "COMPLETE",
            "SUBMISSION",
            "PENDING_RESPONSE",
            "ADMITTED",
            "NOT_ADMITTED",
          ]),
        })
      )
      .mutation(({ ctx, input }) => updateApplicationStatus(input.id, input.status, ctx.user.id)),
    transitionGuide: staffProcedure.query(() => applicationStatuses),
  }),
  action: router({
    processDecision: publicProcedure
      .input(z.object({ token: z.string().min(20).max(128) }))
      .mutation(async ({ input }) => {
        const tokenRecord = await consumeActionToken(input.token);
        if (!tokenRecord) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ce lien de décision est invalide ou a déjà été utilisé.",
          });
        }

        if (tokenRecord.actionType === "approve_user") {
          const user = await updateUserAccountStatus(tokenRecord.targetId, "approved", null);
          return {
            success: true,
            action: "approve",
            message: `Le compte de ${user?.name || user?.email || "l'utilisateur #" + tokenRecord.targetId} a été approuvé avec succès.`,
          };
        }

        if (tokenRecord.actionType === "reject_user") {
          const user = await updateUserAccountStatus(tokenRecord.targetId, "rejected", null);
          return {
            success: true,
            action: "reject",
            message: `Le compte de ${user?.name || user?.email || "l'utilisateur #" + tokenRecord.targetId} a été refusé.`,
          };
        }

        throw new TRPCError({ code: "BAD_REQUEST", message: "Action non prise en charge" });
      }),
  }),
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z
            .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
            .max(12),
          locale: z.string().max(8).default("fr"),
        })
      )
      .mutation(async ({ input }) => {
        const language =
          ({ fr: "français", en: "anglais", ro: "roumain", pt: "portugais", ar: "arabe" } as Record<
            string,
            string
          >)[input.locale] ?? "français";
        const latestQuestion =
          [...input.messages].reverse().find((message) => message.role === "user")?.content ?? "";
        const selectedSources = selectChatSources(latestQuestion);
        const sources = publicSources(selectedSources);
        const fallback = localizedSourceFallback(input.locale, selectedSources);
        const currentWebContext = await formatLiveSourcesForPrompt(selectedSources);
        try {
          const response = await invokeLLM({
            model: "gpt-5-mini",
            maxTokens: 1100,
            messages: [
              {
                role: "system",
                content: `Tu es l’assistant autonome, précis et réactif d’ICX POWER SOLUTIONS SRL. Réponds exclusivement en ${language}.
${chatSourcePolicy}

DOSSIER DE SOURCES SÉLECTIONNÉ :
${formatSourcesForPrompt(selectedSources)}

CONTEXTE ACTUEL DES SOURCES AUTORISÉES :
${currentWebContext}`,
              },
              ...input.messages,
            ],
          });
          const content = response.choices[0]?.message.content;
          if (typeof content === "string" && content.trim()) return { answer: content.trim(), sources };
          if (Array.isArray(content)) {
            const text = content
              .filter((part): part is { type: "text"; text: string } => part.type === "text")
              .map((part) => part.text)
              .join("\n")
              .trim();
            if (text) return { answer: text, sources };
          }
          return { answer: fallback, sources };
        } catch (error) {
          console.warn("[AI chat] Source-grounded fallback:", error instanceof Error ? error.message : error);
          return { answer: fallback, sources };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
