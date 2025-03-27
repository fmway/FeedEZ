CREATE TABLE `foo` (
	`bar` text DEFAULT 'Hey!' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hour` integer NOT NULL,
	`minute` integer NOT NULL,
	`setting_id` integer,
	FOREIGN KEY (`setting_id`) REFERENCES `setting`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "hour_check1" CHECK("schedule"."hour" > -1 AND "schedule"."hour" < 24),
	CONSTRAINT "minute_check1" CHECK("schedule"."minute" > -1 AND "schedule"."minute" < 60)
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`speed` integer DEFAULT 4,
	`duration` integer DEFAULT 300,
	CONSTRAINT "speed_check1" CHECK("setting"."speed" > 0 AND "setting"."speed" < 6),
	CONSTRAINT "duration_check1" CHECK("setting"."duration" > 0)
);
