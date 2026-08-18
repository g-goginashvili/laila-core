CREATE TABLE "organisations" (
	"id" varchar(255) PRIMARY KEY,
	"adminUserId" varchar(255) NOT NULL,
	"org_name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"single_location" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"surname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"phone_number" varchar(255) NOT NULL UNIQUE,
	"role" varchar(25) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_adminUserId_users_id_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id");