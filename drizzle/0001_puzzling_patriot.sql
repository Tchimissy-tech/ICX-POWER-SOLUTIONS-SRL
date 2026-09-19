CREATE TABLE `applicationDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`ownerId` int NOT NULL,
	`documentType` enum('passport','national_id','diploma','transcript','cv','motivation_letter','photo','language_certificate','financial_proof','recommendation_letter','other') NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`byteSize` int NOT NULL,
	`validationStatus` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applicationDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`destination` varchar(120) NOT NULL,
	`studyLevel` varchar(80) NOT NULL,
	`field` varchar(160) NOT NULL,
	`budgetRange` varchar(80),
	`preferredLanguage` varchar(80),
	`institutionId` int,
	`programmeId` int,
	`status` enum('DRAFT','RECEIVED','VERIFICATION','MISSING_DOCUMENTS','COMPLETE','SUBMISSION','PENDING_RESPONSE','ADMITTED','NOT_ADMITTED') NOT NULL DEFAULT 'DRAFT',
	`applicantNote` text,
	`internalNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `applications_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(120) NOT NULL,
	`city` varchar(120),
	`officialSite` varchar(500) NOT NULL,
	`admissionUrl` varchar(500),
	`summary` text NOT NULL,
	`languages` json NOT NULL,
	`levels` json NOT NULL,
	`relationshipType` enum('official_partner','listed_institution','recommended_institution','supplier','commercial_partner','partnership_in_progress') NOT NULL DEFAULT 'listed_institution',
	`sourceUrl` varchar(500) NOT NULL,
	`verifiedAt` timestamp,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutions_id` PRIMARY KEY(`id`),
	CONSTRAINT `institutions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `programmes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`institutionId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`field` varchar(120) NOT NULL,
	`studyLevel` varchar(80) NOT NULL,
	`language` varchar(80),
	`officialUrl` varchar(500),
	`sourceUrl` varchar(500) NOT NULL,
	`verifiedAt` timestamp,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programmes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`type` enum('sourcing','partnership','contact','property','appointment') NOT NULL,
	`status` enum('received','analysis','in_progress','waiting','closed') NOT NULL DEFAULT 'received',
	`requesterName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`organization` varchar(180),
	`country` varchar(120),
	`payload` json NOT NULL,
	`assignedTo` int,
	`internalNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceRequests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','super_admin','administrator','admissions_manager','sourcing_manager','real_estate_manager','partnership_manager','editor','agent') NOT NULL DEFAULT 'user';