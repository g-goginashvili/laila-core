ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'upcoming';--> statement-breakpoint
-- Seated parties from earlier days were never closed off; treat them as completed so they don't lock tables.
UPDATE "reservations" SET "status" = CASE
    WHEN "status" IN ('unconfirmed', 'confirmed') THEN 'upcoming'
    WHEN "status" = 'seated' AND "date" >= current_date - 1 THEN 'ongoing'
    WHEN "status" IN ('seated', 'finished') THEN 'completed'
    ELSE "status"
END;--> statement-breakpoint
-- Tables of guests already seated count as occupied from now on, so they follow the new rule.
UPDATE "store_tables" SET "occupied_since" = coalesce("occupied_since", now())
WHERE "id" IN (SELECT "table_id" FROM "reservations" WHERE "status" = 'ongoing' AND "table_id" IS NOT NULL);
