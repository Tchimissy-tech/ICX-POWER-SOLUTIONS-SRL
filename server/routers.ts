import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { applicationStatuses, documentTypes, requestTypes, userRoles } from "../drizzle/schema";
import {
  addApplicationDocument,
  createApplication,
  createServiceRequest,
  getAdminMetrics,
  getApplicationForUser,
  getInstitutionBySlug,
  listApplicationsForUser,
  listDocumentsForApplication,
  listInstitutions,
  listServiceRequests,
} from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

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
        requesterName: z.string().min(2).max(180),
        email: z.string().email().max(320),
        organization: z.string().max(180).optional(),
        country: z.string().max(120).optional(),
        payload: z.record(z.string(), z.unknown()),
        website: z.string().max(0).optional(), // honeypot: should stay empty
      }))
      .mutation(async ({ input }) => {
        if (input.website) throw new TRPCError({ code: "BAD_REQUEST" });
        const { website: _website, ...request } = input;
        return createServiceRequest({ ...request, reference: createReference("REQ"), status: "received" });
      }),
  }),
  admin: router({
    metrics: staffProcedure.query(() => getAdminMetrics()),
    requests: staffProcedure.query(() => listServiceRequests()),
    transitionGuide: staffProcedure.query(() => applicationStatuses),
  }),
});

export type AppRouter = typeof appRouter;
