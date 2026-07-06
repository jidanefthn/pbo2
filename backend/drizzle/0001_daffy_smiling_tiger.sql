CREATE TYPE "public"."seat_status" AS ENUM('available', 'booked');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" ALTER COLUMN "status" SET DEFAULT 'available'::"public"."seat_status";--> statement-breakpoint
ALTER TABLE "seats" ALTER COLUMN "status" SET DATA TYPE "public"."seat_status" USING "status"::"public"."seat_status";--> statement-breakpoint
ALTER TABLE "seats" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "studios" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "status" text DEFAULT 'confirmed' NOT NULL;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "poster_url" text;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "price" integer NOT NULL;