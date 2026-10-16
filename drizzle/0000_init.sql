CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `activity_entity_idx` ON `activity_log` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`event_id` text,
	`scanned_by` text,
	`seats_in` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scanned_by`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkins_guest_event_uq` ON `checkins` (`guest_id`,`event_id`) WHERE "checkins"."event_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `checkins_guest_all_uq` ON `checkins` (`guest_id`) WHERE "checkins"."event_id" is null;--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`venue_name` text,
	`address` text,
	`lat_e6` integer,
	`lng_e6` integer,
	`maps_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "events_type_ck" CHECK("events"."type" in ('ceremonie', 'henne', 'fete_femmes', 'fete_hommes', 'fete_mixte', 'cortege', 'diner', 'autre'))
);
--> statement-breakpoint
CREATE INDEX `events_invitation_idx` ON `events` (`invitation_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`group_label` text,
	`max_seats` integer DEFAULT 1 NOT NULL,
	`code` text NOT NULL,
	`allowed_event_ids` text,
	`locale` text,
	`table_label` text,
	`sent_at` integer,
	`first_opened_at` integer,
	`open_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "guests_seats_ck" CHECK("guests"."max_seats" between 1 and 50)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guests_code_unique` ON `guests` (`code`);--> statement-breakpoint
CREATE INDEX `guests_invitation_idx` ON `guests` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `guests_name_idx` ON `guests` (`invitation_id`,`name`);--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`owner_id` text,
	`template_id` text NOT NULL,
	`slug` text NOT NULL,
	`event_type` text NOT NULL,
	`config` text NOT NULL,
	`languages` text DEFAULT '["fr","ar"]' NOT NULL,
	`discreet_mode` integer DEFAULT false NOT NULL,
	`access_code_hash` text,
	`allow_generic_link` integer DEFAULT true NOT NULL,
	`rsvp_open` integer DEFAULT true NOT NULL,
	`rsvp_deadline` integer,
	`music_key` text,
	`is_published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`expires_at` integer,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "invitations_event_type_ck" CHECK("invitations"."event_type" in ('mariage', 'fiancailles', 'khotba', 'henne', 'tasdira', 'walima', 'anniversaire', 'naissance', 'aqiqa', 'circoncision', 'reussite', 'hajj', 'aid_ramadan', 'entreprise'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_order_id_unique` ON `invitations` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE INDEX `invitations_owner_idx` ON `invitations` (`owner_id`);--> statement-breakpoint
CREATE INDEX `invitations_expires_idx` ON `invitations` (`expires_at`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`invitation_id` text,
	`kind` text NOT NULL,
	`r2_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`uploaded_by_guest` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_r2_key_unique` ON `media` (`r2_key`);--> statement-breakpoint
CREATE INDEX `media_invitation_idx` ON `media` (`invitation_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`tracking_code` text NOT NULL,
	`customer_id` text,
	`contact_name` text NOT NULL,
	`contact_whatsapp` text NOT NULL,
	`contact_email` text,
	`template_id` text NOT NULL,
	`pack` text NOT NULL,
	`options` text DEFAULT '[]' NOT NULL,
	`amount_da` integer NOT NULL,
	`discount_da` integer DEFAULT 0 NOT NULL,
	`promo_code_id` text,
	`status` text DEFAULT 'nouvelle' NOT NULL,
	`assigned_to` text,
	`source` text,
	`internal_notes` text,
	`due_at` integer,
	`delivered_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assigned_to`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "orders_status_ck" CHECK("orders"."status" in ('nouvelle', 'paiement_en_attente', 'payee', 'en_creation', 'livree', 'terminee', 'annulee')),
	CONSTRAINT "orders_pack_ck" CHECK("orders"."pack" in ('essentiel', 'premium', 'prestige')),
	CONSTRAINT "orders_amount_ck" CHECK("orders"."amount_da" >= 0 and "orders"."discount_da" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_tracking_code_unique` ON `orders` (`tracking_code`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_assigned_idx` ON `orders` (`assigned_to`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`method` text NOT NULL,
	`amount_da` integer NOT NULL,
	`receipt_key` text,
	`provider_ref` text,
	`status` text DEFAULT 'en_attente' NOT NULL,
	`refusal_reason` text,
	`validated_by` text,
	`validated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`validated_by`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "payments_method_ck" CHECK("payments"."method" in ('baridimob', 'ccp', 'edahabia', 'cib', 'especes')),
	CONSTRAINT "payments_status_ck" CHECK("payments"."status" in ('en_attente', 'valide', 'refuse', 'rembourse')),
	CONSTRAINT "payments_amount_ck" CHECK("payments"."amount_da" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_provider_ref_unique` ON `payments` (`provider_ref`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text,
	`whatsapp` text,
	`locale` text DEFAULT 'fr' NOT NULL,
	`role` text DEFAULT 'client' NOT NULL,
	`partner_code_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`partner_code_id`) REFERENCES `promo_codes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `profiles_role_idx` ON `profiles` (`role`);--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`kind` text NOT NULL,
	`value` integer NOT NULL,
	`partner_name` text,
	`partner_phone` text,
	`commission_percent` integer DEFAULT 0 NOT NULL,
	`max_uses` integer,
	`used_count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promo_codes_code_unique` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`rating` integer NOT NULL,
	`text` text,
	`screenshot_key` text,
	`consent_to_publish` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reviews_rating_ck" CHECK("reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_order_id_unique` ON `reviews` (`order_id`);--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`guest_id` text,
	`event_id` text,
	`name` text NOT NULL,
	`answer` text NOT NULL,
	`seats` integer DEFAULT 1 NOT NULL,
	`message` text,
	`source` text DEFAULT 'lien' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "rsvps_answer_ck" CHECK("rsvps"."answer" in ('oui', 'non', 'peut_etre')),
	CONSTRAINT "rsvps_seats_ck" CHECK("rsvps"."seats" >= 0)
);
--> statement-breakpoint
CREATE INDEX `rsvps_invitation_idx` ON `rsvps` (`invitation_id`,`answer`);--> statement-breakpoint
CREATE UNIQUE INDEX `rsvps_guest_event_uq` ON `rsvps` (`guest_id`,`event_id`) WHERE "rsvps"."event_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `rsvps_guest_all_uq` ON `rsvps` (`guest_id`) WHERE "rsvps"."event_id" is null and "rsvps"."guest_id" is not null;--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`event_types` text NOT NULL,
	`style` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`preview_image` text NOT NULL,
	`preview_video` text,
	`base_price_da` integer NOT NULL,
	`min_pack` text DEFAULT 'essentiel' NOT NULL,
	`config_schema_version` integer DEFAULT 1 NOT NULL,
	`badges` text DEFAULT '[]' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);--> statement-breakpoint
CREATE INDEX `templates_active_sort_idx` ON `templates` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`guest_id` text,
	`name` text NOT NULL,
	`message` text,
	`audio_key` text,
	`is_approved` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `wishes_invitation_idx` ON `wishes` (`invitation_id`,`created_at`);