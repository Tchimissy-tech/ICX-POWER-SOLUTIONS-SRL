CREATE TYPE "user_role" AS ENUM ('user', 'admin', 'super_admin', 'administrator', 'admissions_manager', 'sourcing_manager', 'real_estate_manager', 'partnership_manager', 'editor', 'agent');
--> statement-breakpoint
CREATE TYPE "account_status" AS ENUM ('pending', 'approved', 'rejected');
--> statement-breakpoint
CREATE TYPE "relationship_type" AS ENUM ('official_partner', 'listed_institution', 'recommended_institution', 'supplier', 'commercial_partner', 'partnership_in_progress');
--> statement-breakpoint
CREATE TYPE "application_status" AS ENUM ('DRAFT', 'RECEIVED', 'VERIFICATION', 'MISSING_DOCUMENTS', 'COMPLETE', 'SUBMISSION', 'PENDING_RESPONSE', 'ADMITTED', 'NOT_ADMITTED');
--> statement-breakpoint
CREATE TYPE "document_type" AS ENUM ('passport', 'national_id', 'diploma', 'transcript', 'cv', 'motivation_letter', 'photo', 'language_certificate', 'financial_proof', 'recommendation_letter', 'other');
--> statement-breakpoint
CREATE TYPE "request_type" AS ENUM ('sourcing', 'partnership', 'contact', 'property', 'appointment');
--> statement-breakpoint
CREATE TYPE "request_status" AS ENUM ('received', 'analysis', 'in_progress', 'waiting', 'closed');
--> statement-breakpoint
CREATE TYPE "validation_status" AS ENUM ('pending', 'accepted', 'rejected');
--> statement-breakpoint
CREATE TABLE "applicationDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationId" integer NOT NULL,
	"ownerId" integer NOT NULL,
	"documentType" "document_type" NOT NULL,
	"fileKey" varchar(512) NOT NULL,
	"originalName" varchar(255) NOT NULL,
	"mimeType" varchar(120) NOT NULL,
	"byteSize" integer NOT NULL,
	"validationStatus" "validation_status" DEFAULT 'pending' NOT NULL,
	"reviewedBy" integer,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"userId" integer NOT NULL,
	"destination" varchar(120) NOT NULL,
	"studyLevel" varchar(80) NOT NULL,
	"field" varchar(160) NOT NULL,
	"budgetRange" varchar(80),
	"preferredLanguage" varchar(80),
	"institutionId" integer,
	"programmeId" integer,
	"status" "application_status" DEFAULT 'DRAFT' NOT NULL,
	"applicantNote" text,
	"internalNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actorId" integer,
	"action" varchar(120) NOT NULL,
	"entityType" varchar(80) NOT NULL,
	"entityId" varchar(80),
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(180) NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(120) NOT NULL,
	"city" varchar(120),
	"officialSite" varchar(500) NOT NULL,
	"admissionUrl" varchar(500),
	"summary" text NOT NULL,
	"languages" jsonb NOT NULL,
	"levels" jsonb NOT NULL,
	"relationshipType" "relationship_type" DEFAULT 'listed_institution' NOT NULL,
	"sourceUrl" varchar(500) NOT NULL,
	"verifiedAt" timestamp with time zone,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "institutions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "programmes" (
	"id" serial PRIMARY KEY NOT NULL,
	"institutionId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"field" varchar(120) NOT NULL,
	"studyLevel" varchar(80) NOT NULL,
	"language" varchar(80),
	"officialUrl" varchar(500),
	"sourceUrl" varchar(500) NOT NULL,
	"verifiedAt" timestamp with time zone,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serviceRequestDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"requestId" integer NOT NULL,
	"uploadToken" varchar(96) NOT NULL,
	"documentType" "document_type" NOT NULL,
	"fileKey" varchar(512) NOT NULL,
	"originalName" varchar(255) NOT NULL,
	"mimeType" varchar(120) NOT NULL,
	"byteSize" integer NOT NULL,
	"validationStatus" "validation_status" DEFAULT 'pending' NOT NULL,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serviceRequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"type" "request_type" NOT NULL,
	"status" "request_status" DEFAULT 'received' NOT NULL,
	"requesterName" varchar(180) NOT NULL,
	"email" varchar(320) NOT NULL,
	"uploadToken" varchar(96) NOT NULL,
	"organization" varchar(180),
	"country" varchar(120),
	"payload" jsonb NOT NULL,
	"assignedTo" integer,
	"internalNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "serviceRequests_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"accountStatus" "account_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
