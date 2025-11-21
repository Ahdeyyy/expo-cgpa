CREATE TABLE `courses_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`courseName` text NOT NULL,
	`credits` integer NOT NULL,
	`grade` text NOT NULL,
	`semesterId` integer NOT NULL,
	`isElective` integer DEFAULT false NOT NULL,
	`countsTowardsCGPA` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`semesterId`) REFERENCES `semesters_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `semesters_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`semesterName` text NOT NULL,
	`year` integer NOT NULL
);
