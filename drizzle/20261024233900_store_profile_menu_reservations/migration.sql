CREATE TABLE "menu_groups" (
	"id" varchar(255) PRIMARY KEY,
	"store_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" varchar(255) PRIMARY KEY,
	"store_id" varchar(255) NOT NULL,
	"group_id" varchar(255) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_cents" integer NOT NULL,
	"components" jsonb DEFAULT '[]' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" varchar(255) PRIMARY KEY,
	"store_id" varchar(255) NOT NULL,
	"table_id" varchar(255),
	"date" date NOT NULL,
	"start_minutes" smallint NOT NULL,
	"duration_minutes" smallint NOT NULL,
	"party_size" smallint NOT NULL,
	"guest_name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" varchar(20) DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_closures" (
	"id" varchar(255) PRIMARY KEY,
	"store_id" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"note" varchar(255) DEFAULT '' NOT NULL,
	CONSTRAINT "store_closures_store_date_key" UNIQUE("store_id","date")
);
--> statement-breakpoint
CREATE TABLE "store_hours" (
	"id" varchar(255) PRIMARY KEY,
	"store_id" varchar(255) NOT NULL,
	"weekday" smallint NOT NULL,
	"opens_minutes" smallint NOT NULL,
	"closes_minutes" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_tables" (
	"id" varchar(255) PRIMARY KEY,
	"store_id" varchar(255) NOT NULL,
	"label" varchar(20) NOT NULL,
	"seats" smallint NOT NULL,
	"area" varchar(50) DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "store_tables_store_label_key" UNIQUE("store_id","label")
);
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "postcode" varchar(20) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "city" varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "region" varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "country" varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "website" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "status" varchar(20) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "closure_note" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "reopens_on" date;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "timezone" varchar(64) DEFAULT 'Europe/Athens' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "cuisine" varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "price_range" varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "opened_on" date;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "floor_area_m2" integer;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "min_party_size" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "max_party_size" integer DEFAULT 8 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "table_time_minutes" integer DEFAULT 120 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "lunch_table_time_minutes" integer;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "last_seating_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "booking_window_days" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "min_notice_hours" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "deposit_per_guest_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "deposit_min_party" integer;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "cancellation_hours" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "grace_period_minutes" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "menu_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "menu_groups_store_idx" ON "menu_groups" ("store_id");--> statement-breakpoint
CREATE INDEX "menu_items_group_idx" ON "menu_items" ("group_id");--> statement-breakpoint
CREATE INDEX "reservations_store_date_idx" ON "reservations" ("store_id","date");--> statement-breakpoint
CREATE INDEX "store_hours_store_idx" ON "store_hours" ("store_id");--> statement-breakpoint
ALTER TABLE "menu_groups" ADD CONSTRAINT "menu_groups_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_group_id_menu_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "menu_groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_store_tables_id_fkey" FOREIGN KEY ("table_id") REFERENCES "store_tables"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "store_closures" ADD CONSTRAINT "store_closures_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "store_hours" ADD CONSTRAINT "store_hours_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "store_tables" ADD CONSTRAINT "store_tables_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;