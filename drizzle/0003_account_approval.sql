ALTER TABLE `users` ADD `accountStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending';
