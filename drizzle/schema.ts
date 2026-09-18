import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Identity is provisioned by Manus OAuth. Business roles control the ICX workspace.
 * Privileged roles are assigned by a super administrator; never from the public UI.
 */
export const userRoles = [
  "user",
  "admin",
  "super_admin",
  "administrator",
  "admissions_manager",
  "sourcing_manager",
  "real_estate_manager",
  "partnership_manager",
  "editor",
  "agent",
] as const;

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", userRoles).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const relationshipTypes = [
  "official_partner",
  "listed_institution",
  "recommended_institution",
  "supplier",
  "commercial_partner",
  "partnership_in_progress",
] as const;

export const institutions = mysqlTable("institutions", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }),
  officialSite: varchar("officialSite", { length: 500 }).notNull(),
  admissionUrl: varchar("admissionUrl", { length: 500 }),
  summary: text("summary").notNull(),
  languages: json("languages").$type<string[]>().notNull(),
  levels: json("levels").$type<string[]>().notNull(),
  relationshipType: mysqlEnum("relationshipType", relationshipTypes)
    .default("listed_institution")
    .notNull(),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const programmes = mysqlTable("programmes", {
  id: int("id").autoincrement().primaryKey(),
  institutionId: int("institutionId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  field: varchar("field", { length: 120 }).notNull(),
  studyLevel: varchar("studyLevel", { length: 80 }).notNull(),
  language: varchar("language", { length: 80 }),
  officialUrl: varchar("officialUrl", { length: 500 }),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const applicationStatuses = [
  "DRAFT",
  "RECEIVED",
  "VERIFICATION",
  "MISSING_DOCUMENTS",
  "COMPLETE",
  "SUBMISSION",
  "PENDING_RESPONSE",
  "ADMITTED",
  "NOT_ADMITTED",
] as const;

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  userId: int("userId").notNull(),
  destination: varchar("destination", { length: 120 }).notNull(),
  studyLevel: varchar("studyLevel", { length: 80 }).notNull(),
  field: varchar("field", { length: 160 }).notNull(),
  budgetRange: varchar("budgetRange", { length: 80 }),
  preferredLanguage: varchar("preferredLanguage", { length: 80 }),
  institutionId: int("institutionId"),
  programmeId: int("programmeId"),
  status: mysqlEnum("status", applicationStatuses).default("DRAFT").notNull(),
  applicantNote: text("applicantNote"),
  internalNote: text("internalNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const documentTypes = [
  "passport",
  "national_id",
  "diploma",
  "transcript",
  "cv",
  "motivation_letter",
  "photo",
  "language_certificate",
  "financial_proof",
  "recommendation_letter",
  "other",
] as const;

export const applicationDocuments = mysqlTable("applicationDocuments", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  ownerId: int("ownerId").notNull(),
  documentType: mysqlEnum("documentType", documentTypes).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  byteSize: int("byteSize").notNull(),
  validationStatus: mysqlEnum("validationStatus", ["pending", "accepted", "rejected"])
    .default("pending")
    .notNull(),
  reviewedBy: int("reviewedBy"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const requestTypes = ["sourcing", "partnership", "contact", "property", "appointment"] as const;
export const requestStatuses = ["received", "analysis", "in_progress", "waiting", "closed"] as const;

export const serviceRequests = mysqlTable("serviceRequests", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  type: mysqlEnum("type", requestTypes).notNull(),
  status: mysqlEnum("status", requestStatuses).default("received").notNull(),
  requesterName: varchar("requesterName", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 180 }),
  country: varchar("country", { length: 120 }),
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  assignedTo: int("assignedTo"),
  internalNote: text("internalNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
