ALTER TABLE "diners" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "diners" ADD COLUMN "surname" varchar(255);--> statement-breakpoint
ALTER TABLE "diners" ADD COLUMN "phone_number" varchar(255);--> statement-breakpoint
ALTER TABLE "diners" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "diners" ADD CONSTRAINT "diners_phone_number_key" UNIQUE("phone_number");