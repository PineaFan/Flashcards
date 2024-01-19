DO $$ BEGIN
 CREATE TYPE "card_states_enum" AS ENUM('incorrect', 'almost', 'correct');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "packVisibility" AS ENUM('public', 'unlisted', 'private');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_states" (
	"user_id" uuid,
	"card_id" uuid,
	"state" "card_states_enum",
	CONSTRAINT "card_states_user_id_card_id_pk" PRIMARY KEY("user_id","card_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"prompt" varchar(4096),
	"response" varchar(4096),
	"pack" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"description" varchar(4096),
	"colour" varchar(6),
	"visibility" "packVisibility",
	"owner" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"display_name" varchar(256),
	"avatar" varchar,
	"email" varchar(256),
	"discord_id" varchar(256),
	"google_id" varchar(256),
	"github_id" varchar(256),
	"clicks_id" varchar(256),
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "users_clicks_id_unique" UNIQUE("clicks_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_states" ADD CONSTRAINT "card_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_states" ADD CONSTRAINT "card_states_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_packs_id_fk" FOREIGN KEY ("pack") REFERENCES "packs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "packs" ADD CONSTRAINT "packs_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
