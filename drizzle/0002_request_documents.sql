ALTER TABLE `serviceRequests` ADD `uploadToken` varchar(96) NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE `serviceRequestDocuments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `requestId` int NOT NULL,
  `uploadToken` varchar(96) NOT NULL,
  `documentType` enum('passport','national_id','diploma','transcript','cv','motivation_letter','photo','language_certificate','financial_proof','recommendation_letter','other') NOT NULL,
  `fileKey` varchar(512) NOT NULL,
  `originalName` varchar(255) NOT NULL,
  `mimeType` varchar(120) NOT NULL,
  `byteSize` int NOT NULL,
  `validationStatus` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `uploadedAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `serviceRequestDocuments_id` PRIMARY KEY(`id`)
);
