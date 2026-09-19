import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoles = ["user", "admin", "super_admin", "administrator", "admissions_manager", "sourcing_manager", "real_estate_manager", "partnership_manager", "editor", "agent"] as const;
export const accountStatuses = ["pending", "approved", "rejected"] as const;
export const relationshipTypes = ["official_partner", "listed_institution", "recommended_institution", "supplier", "commercial_partner", "partnership_in_progress"] as const;
export const applicationStatuses = ["DRAFT", "RECEIVED", "VERIFICATION", "MISSING_DOCUMENTS", "COMPLETE", "SUBMISSION", "PENDING_RESPONSE", "ADMITTED", "NOT_ADMITTED"] as const;
export const documentTypes = ["passport", "national_id", "diploma", "transcript", "cv", "motivation_letter", "photo", "language_certificate", "financial_proof", "recommendation_letter", "other"] as const;
export const requestTypes = ["sourcing", "partnership", "contact", "property", "appointment"] as const;
export const requestStatuses = ["received", "analysis", "in_progress", "waiting", "closed"] as const;
export const validationStatuses = ["pending", "accepted", "rejected"] as const;

const userRoleEnum = pgEnum("user_role", userRoles);
const accountStatusEnum = pgEnum("account_status", accountStatuses);
const relationshipTypeEnum = pgEnum("relationship_type", relationshipTypes);
const applicationStatusEnum = pgEnum("application_status", applicationStatuses);
const documentTypeEnum = pgEnum("document_type", documentTypes);
const requestTypeEnum = pgEnum("request_type", requestTypes);
const requestStatusEnum = pgEnum("request_status", requestStatuses);
const validationStatusEnum = pgEnum("validation_status", validationStatuses);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  accountStatus: accountStatusEnum("accountStatus").default("pending").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
}));

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }),
  officialSite: varchar("officialSite", { length: 500 }).notNull(),
  admissionUrl: varchar("admissionUrl", { length: 500 }),
  summary: text("summary").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  levels: jsonb("levels").$type<string[]>().notNull(),
  relationshipType: relationshipTypeEnum("relationshipType").default("listed_institution").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  verifiedAt: timestamp("verifiedAt", { withTimezone: true }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const programmes = pgTable("programmes", {
  id: serial("id").primaryKey(),
  institutionId: integer("institutionId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  field: varchar("field", { length: 120 }).notNull(),
  studyLevel: varchar("studyLevel", { length: 80 }).notNull(),
  language: varchar("language", { length: 80 }),
  officialUrl: varchar("officialUrl", { length: 500 }),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  verifiedAt: timestamp("verifiedAt", { withTimezone: true }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  userId: integer("userId").notNull(),
  destination: varchar("destination", { length: 120 }).notNull(),
  studyLevel: varchar("studyLevel", { length: 80 }).notNull(),
  field: varchar("field", { length: 160 }).notNull(),
  budgetRange: varchar("budgetRange", { length: 80 }),
  preferredLanguage: varchar("preferredLanguage", { length: 80 }),
  institutionId: integer("institutionId"),
  programmeId: integer("programmeId"),
  status: applicationStatusEnum("status").default("DRAFT").notNull(),
  applicantNote: text("applicantNote"),
  internalNote: text("internalNote"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const applicationDocuments = pgTable("applicationDocuments", {
  id: serial("id").primaryKey(),
  applicationId: integer("applicationId").notNull(),
  ownerId: integer("ownerId").notNull(),
  documentType: documentTypeEnum("documentType").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  byteSize: integer("byteSize").notNull(),
  validationStatus: validationStatusEnum("validationStatus").default("pending").notNull(),
  reviewedBy: integer("reviewedBy"),
  uploadedAt: timestamp("uploadedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceRequests = pgTable("serviceRequests", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  type: requestTypeEnum("type").notNull(),
  status: requestStatusEnum("status").default("received").notNull(),
  requesterName: varchar("requesterName", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  uploadToken: varchar("uploadToken", { length: 96 }).notNull(),
  organization: varchar("organization", { length: 180 }),
  country: varchar("country", { length: 120 }),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  assignedTo: integer("assignedTo"),
  internalNote: text("internalNote"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceRequestDocuments = pgTable("serviceRequestDocuments", {
  id: serial("id").primaryKey(),
  requestId: integer("requestId").notNull(),
  uploadToken: varchar("uploadToken", { length: 96 }).notNull(),
  documentType: documentTypeEnum("documentType").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  byteSize: integer("byteSize").notNull(),
  validationStatus: validationStatusEnum("validationStatus").default("pending").notNull(),
  uploadedAt: timestamp("uploadedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  actorId: integer("actorId"),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
