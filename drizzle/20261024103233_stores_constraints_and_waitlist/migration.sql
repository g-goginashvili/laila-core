CREATE TABLE "waitlist" (
	"id" varchar(255) PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_email_key";--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_phone_number_key";--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_admin_user_id_key" UNIQUE("admin_user_id");