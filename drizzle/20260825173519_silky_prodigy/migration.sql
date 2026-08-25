CREATE TABLE "stores" (
	"id" varchar(255) PRIMARY KEY,
	"admin_user_id" varchar(255) NOT NULL,
	"organisation_id" varchar(255) NOT NULL,
	"store_name" varchar(255) NOT NULL,
	"store_manager" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"phone_number" varchar(255) NOT NULL UNIQUE
);
--> statement-breakpoint
ALTER TABLE "organisations" RENAME COLUMN "adminUserId" TO "admin_user_id";--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_admin_user_id_users_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_organisation_id_organisations_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id");