ALTER TABLE "eventos" ADD COLUMN "prazo_confirmacao" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "eventos" ADD COLUMN "lista_presentes" boolean DEFAULT true NOT NULL;