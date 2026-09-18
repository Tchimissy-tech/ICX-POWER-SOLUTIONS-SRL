import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  applicationDocuments,
  applications,
  institutions,
  serviceRequestDocuments,
  serviceRequests,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Connection unavailable", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "super_admin";
    updateSet.role = "super_admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listInstitutions(filters: { query?: string; country?: string }) {
  const db = await getDb();
  if (!db) return [];
  const where = [eq(institutions.isPublished, true)];
  if (filters.country) where.push(eq(institutions.country, filters.country));
  if (filters.query) {
    const term = `%${filters.query.trim()}%`;
    where.push(or(like(institutions.name, term), like(institutions.city, term))!);
  }
  return db
    .select()
    .from(institutions)
    .where(and(...where))
    .orderBy(institutions.name);
}

export async function getInstitutionBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(institutions)
    .where(and(eq(institutions.slug, slug), eq(institutions.isPublished, true)))
    .limit(1);
  return result[0];
}

export async function createApplication(
  userId: number,
  data: Omit<typeof applications.$inferInsert, "userId" | "reference">
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const reference = `ICX-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  await db.insert(applications).values({ ...data, userId, reference });
  await createAuditLog(userId, "application.created", "application", reference, { destination: data.destination });
  return { reference };
}

export async function listApplicationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.updatedAt));
}

export async function getApplicationForUser(userId: number, reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(applications)
    .where(and(eq(applications.userId, userId), eq(applications.reference, reference)))
    .limit(1);
  return result[0];
}

export async function addApplicationDocument(data: typeof applicationDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(applicationDocuments).values(data);
  await createAuditLog(data.ownerId, "document.uploaded", "application", String(data.applicationId), {
    documentType: data.documentType,
    fileKey: data.fileKey,
  });
}

export async function listDocumentsForApplication(applicationId: number, ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: applicationDocuments.id,
      documentType: applicationDocuments.documentType,
      originalName: applicationDocuments.originalName,
      mimeType: applicationDocuments.mimeType,
      byteSize: applicationDocuments.byteSize,
      validationStatus: applicationDocuments.validationStatus,
      uploadedAt: applicationDocuments.uploadedAt,
    })
    .from(applicationDocuments)
    .where(and(eq(applicationDocuments.applicationId, applicationId), eq(applicationDocuments.ownerId, ownerId)))
    .orderBy(desc(applicationDocuments.uploadedAt));
}

export async function createServiceRequest(data: typeof serviceRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(serviceRequests).values(data);
  return { reference: data.reference };
}

export async function getServiceRequestByReference(reference: string, uploadToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(serviceRequests).where(and(eq(serviceRequests.reference, reference), eq(serviceRequests.uploadToken, uploadToken))).limit(1);
  return result[0];
}

export async function addServiceRequestDocument(data: typeof serviceRequestDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(serviceRequestDocuments).values(data);
}

export async function listDocumentsForServiceRequest(requestId: number, uploadToken: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: serviceRequestDocuments.id, documentType: serviceRequestDocuments.documentType, originalName: serviceRequestDocuments.originalName, fileKey: serviceRequestDocuments.fileKey, mimeType: serviceRequestDocuments.mimeType, byteSize: serviceRequestDocuments.byteSize, validationStatus: serviceRequestDocuments.validationStatus, uploadedAt: serviceRequestDocuments.uploadedAt }).from(serviceRequestDocuments).where(and(eq(serviceRequestDocuments.requestId, requestId), eq(serviceRequestDocuments.uploadToken, uploadToken))).orderBy(desc(serviceRequestDocuments.uploadedAt));
}

export async function listServiceRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt)).limit(100);
}

export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) return { applications: 0, requests: 0, institutions: 0, documents: 0 };
  const [[apps], [requests], [listed], [documents]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(applications),
    db.select({ count: sql<number>`count(*)` }).from(serviceRequests),
    db.select({ count: sql<number>`count(*)` }).from(institutions),
    db.select({ count: sql<number>`count(*)` }).from(applicationDocuments),
  ]);
  return {
    applications: Number(apps?.count ?? 0),
    requests: Number(requests?.count ?? 0),
    institutions: Number(listed?.count ?? 0),
    documents: Number(documents?.count ?? 0),
  };
}

export async function createAuditLog(
  actorId: number | null,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) return;
  await db.insert((await import("../drizzle/schema")).auditLogs).values({
    actorId: actorId ?? undefined,
    action,
    entityType,
    entityId,
    metadata,
  });
}

export async function listUsersForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, accountStatus: users.accountStatus, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt)).limit(200);
}

export async function updateUserAccountStatus(id: number, accountStatus: "pending" | "approved" | "rejected", actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ accountStatus }).where(eq(users.id, id));
  await createAuditLog(actorId, `user.${accountStatus}`, "user", String(id));
}

export async function updateServiceRequestStatus(id: number, status: "received" | "analysis" | "in_progress" | "waiting" | "closed", actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id));
  await createAuditLog(actorId, `request.${status}`, "service_request", String(id));
}

export async function listAdminDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: serviceRequestDocuments.id, requestId: serviceRequestDocuments.requestId, originalName: serviceRequestDocuments.originalName, mimeType: serviceRequestDocuments.mimeType, byteSize: serviceRequestDocuments.byteSize, validationStatus: serviceRequestDocuments.validationStatus, uploadedAt: serviceRequestDocuments.uploadedAt }).from(serviceRequestDocuments).orderBy(desc(serviceRequestDocuments.uploadedAt)).limit(200);
}

export async function updateServiceRequestDocumentStatus(id: number, validationStatus: "pending" | "accepted" | "rejected", actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(serviceRequestDocuments).set({ validationStatus }).where(eq(serviceRequestDocuments.id, id));
  await createAuditLog(actorId, `document.${validationStatus}`, "service_request_document", String(id));
}

export async function listAdminApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: applications.id, reference: applications.reference, userId: applications.userId, destination: applications.destination, studyLevel: applications.studyLevel, field: applications.field, status: applications.status, createdAt: applications.createdAt, updatedAt: applications.updatedAt }).from(applications).orderBy(desc(applications.updatedAt)).limit(200);
}

export async function updateApplicationStatus(id: number, status: "DRAFT" | "RECEIVED" | "VERIFICATION" | "MISSING_DOCUMENTS" | "COMPLETE" | "SUBMISSION" | "PENDING_RESPONSE" | "ADMITTED" | "NOT_ADMITTED", actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(applications).set({ status }).where(eq(applications.id, id));
  await createAuditLog(actorId, `application.${status}`, "application", String(id));
}

export async function getAdminDocument(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ id: serviceRequestDocuments.id, fileKey: serviceRequestDocuments.fileKey }).from(serviceRequestDocuments).where(eq(serviceRequestDocuments.id, id)).limit(1);
  return result[0];
}
