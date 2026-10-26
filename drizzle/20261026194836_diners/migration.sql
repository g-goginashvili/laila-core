CREATE TABLE "diners" (
	"id" varchar(255) PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
