import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { applicationStatuses, documentTypes, requestTypes, userRoles } from "../drizzle/schema";
import {
  addApplicationDocument,
  addServiceRequestDocument,
  createApplication,
  createServiceRequest,
  getAdminMetrics,
  getApplicationForUser,
  getServiceRequestByReference,
  getInstitutionBySlug,
  listApplicationsForUser,
  listDocumentsForApplication,
  listInstitutions,
  listServiceRequests,
  listDocumentsForServiceRequest,
  listAdminApplications,
  listAdminDocuments,
  getAdminDocument,
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
import { chatSourcePolicy, formatLiveSourcesForPrompt, formatSourcesForPrompt, localizedSourceFallback, publicSources, selectChatSources } from "./chatKnowledge";

const staffRoles = new Set((userRoles as readonly string[]).filter((role) => role !== "user"));
const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!staffRoles.has(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Staff access required" });
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
  const valid = (mimeType === "application/pdf" && isPdf) || (mimeType === "image/jpeg" && isJpeg) || (mimeType === "image/png" && isPng);
  if (!valid) throw new TRPCError({ code: "BAD_REQUEST", message: "File signature does not match its declared format" });
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 180);
}

function formOperationError(error: unknown, operation: "submit" | "upload") {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Database unavailable")) {
    return new TRPCError({ code: "PRECONDITION_FAILED", message: "Le stockage des demandes n’est pas configuré sur le serveur. Configurez DATABASE_URL dans Render." });
  }
  if (message.includes("Storage config missing") || message.includes("Storage presign") || message.includes("Storage upload")) {
    return new TRPCError({ code: "PRECONDITION_FAILED", message: "Le stockage sécurisé des fichiers n’est pas configuré sur le serveur. Configurez BUILT_IN_FORGE_API_URL et BUILT_IN_FORGE_API_KEY dans Render." });
  }
  console.error(`[Forms] ${operation} failed`, error);
  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: operation === "submit" ? "La demande n’a pas pu être enregistrée. Réessayez dans quelques instants." : "Le fichier n’a pas pu être téléversé. Vérifiez le fichier et réessayez." });
}

function createReference(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
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
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(180) })).query(({ input }) => getInstitutionBySlug(input.slug)),
  }),
  application: router({
    mine: protectedProcedure.query(({ ctx }) => listApplicationsForUser(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        destination: z.string().min(2).max(120),
        studyLevel: z.string().min(2).max(80),
        field: z.string().min(2).max(160),
        budgetRange: z.string().max(80).optional(),
        preferredLanguage: z.string().max(80).optional(),
        institutionId: z.number().int().positive().optional(),
        programmeId: z.number().int().positive().optional(),
        applicantNote: z.string().max(2000).optional(),
      }))
      .mutation(({ ctx, input }) => createApplication(ctx.user.id, { ...input, status: "DRAFT" })),
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
      return { success: true };
    }),
  }),
  request: router({
  submit: publicProcedure
      .input(z.object({
        type: z.enum(requestTypes),
        requesterName: z.string().trim().min(2).max(180),
        email: z.string().trim().email().max(320),
        organization: z.string().trim().max(180).optional(),
        country: z.string().trim().max(120).optional(),
        payload: z.record(z.string(), z.unknown()),
        website: z.string().max(0).optional(), // honeypot: should stay empty
      }))
      .mutation(async ({ input }) => {
        if (input.website) throw new TRPCError({ code: "BAD_REQUEST" });
        const { website: _website, ...request } = input;
        const uploadToken = crypto.randomUUID() + crypto.randomUUID();
        try {
          const created = await createServiceRequest({ ...request, uploadToken, reference: createReference("REQ"), status: "received" });
          return { ...created, uploadToken };
        } catch (error) {
          throw formOperationError(error, "submit");
        }
      }),
    documents: publicProcedure.input(z.object({ reference: z.string().regex(/^REQ-\d{4}-[A-Z0-9-]+$/), uploadToken: z.string().min(32).max(96) })).query(async ({ input }) => {
      const request = await getServiceRequestByReference(input.reference, input.uploadToken);
      if (!request) throw new TRPCError({ code: "NOT_FOUND" });
      return listDocumentsForServiceRequest(request.id, input.uploadToken);
    }),
    uploadDocument: publicProcedure.input(uploadSchema.extend({ reference: z.string().regex(/^REQ-\d{4}-[A-Z0-9-]+$/), uploadToken: z.string().min(32).max(96) })).mutation(async ({ input }) => {
      const request = await getServiceRequestByReference(input.reference, input.uploadToken);
      if (!request) throw new TRPCError({ code: "NOT_FOUND" });
      const raw = input.base64Content.includes(",") ? input.base64Content.split(",")[1] : input.base64Content;
      const bytes = Buffer.from(raw, "base64"); validateFile(bytes, input.mimeType);
      const safeName = cleanFilename(input.fileName);
      try {
        const stored = await storagePut(`icx/private/requests/${request.id}/${crypto.randomUUID()}-${safeName}`, bytes, input.mimeType);
        await addServiceRequestDocument({ requestId: request.id, uploadToken: input.uploadToken, documentType: input.documentType, fileKey: stored.key, originalName: safeName, mimeType: input.mimeType, byteSize: bytes.byteLength });
        return { success: true };
      } catch (error) {
        throw formOperationError(error, "upload");
      }
    }),
  }),
  admin: router({
    metrics: staffProcedure.query(() => getAdminMetrics()),
    requests: staffProcedure.query(() => listServiceRequests()),
    users: staffProcedure.query(() => listUsersForAdmin()),
    applications: staffProcedure.query(() => listAdminApplications()),
    documents: staffProcedure.query(() => listAdminDocuments()),
    updateUserStatus: staffProcedure.input(z.object({ id: z.number().int().positive(), accountStatus: z.enum(["pending", "approved", "rejected"]) })).mutation(({ ctx, input }) => updateUserAccountStatus(input.id, input.accountStatus, ctx.user.id)),
    updateRequestStatus: staffProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["received", "analysis", "in_progress", "waiting", "closed"]) })).mutation(({ ctx, input }) => updateServiceRequestStatus(input.id, input.status, ctx.user.id)),
    documentUrl: staffProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => { const document = await getAdminDocument(input.id); if (!document) throw new TRPCError({ code: "NOT_FOUND" }); return { url: await storageGetSignedUrl(document.fileKey) }; }),
    updateDocumentStatus: staffProcedure.input(z.object({ id: z.number().int().positive(), validationStatus: z.enum(["pending", "accepted", "rejected"]) })).mutation(({ ctx, input }) => updateServiceRequestDocumentStatus(input.id, input.validationStatus, ctx.user.id)),
    updateApplicationStatus: staffProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["DRAFT", "RECEIVED", "VERIFICATION", "MISSING_DOCUMENTS", "COMPLETE", "SUBMISSION", "PENDING_RESPONSE", "ADMITTED", "NOT_ADMITTED"]) })).mutation(({ ctx, input }) => updateApplicationStatus(input.id, input.status, ctx.user.id)),
    transitionGuide: staffProcedure.query(() => applicationStatuses),
  }),
  ai: router({
    chat: publicProcedure.input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).max(12), locale: z.string().max(8).default("fr") })).mutation(async ({ input }) => {
      const language = ({ fr: "français", en: "anglais", ro: "roumain", pt: "portugais", ar: "arabe" } as Record<string, string>)[input.locale] ?? "français";
      const latestQuestion = [...input.messages].reverse().find((message) => message.role === "user")?.content ?? "";
      const selectedSources = selectChatSources(latestQuestion);
      const sources = publicSources(selectedSources);
      const fallback = localizedSourceFallback(input.locale, selectedSources);
      const currentWebContext = await formatLiveSourcesForPrompt(selectedSources);
      try {
        const response = await invokeLLM({ model: "gpt-5-mini", maxTokens: 1100, messages: [{ role: "system", content: `Tu es l’assistant autonome, précis et réactif d’ICX POWER SOLUTIONS SRL. Réponds exclusivement en ${language}.
${chatSourcePolicy}

DOSSIER DE SOURCES SÉLECTIONNÉ :
${formatSourcesForPrompt(selectedSources)}

CONTEXTE ACTUEL DES SOURCES AUTORISÉES :
${currentWebContext}` }, ...input.messages], timeoutMs: 15_000, maxRetries: 1 });
        const content = response.choices[0]?.message.content;
        if (typeof content === "string" && content.trim()) return { answer: content.trim(), sources };
        if (Array.isArray(content)) {
          const text = content.filter((part): part is { type: "text"; text: string } => part.type === "text").map((part) => part.text).join("\n").trim();
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
