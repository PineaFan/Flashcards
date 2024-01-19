ALTER TABLE "card_states" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "card_states" ALTER COLUMN "card_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "card_states" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "prompt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "response" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "pack" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packs" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packs" ALTER COLUMN "visibility" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packs" ALTER COLUMN "owner" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;