CREATE TABLE "catalogo_presentes" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer NOT NULL,
	"nome" text NOT NULL,
	"preco" text DEFAULT '' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"imagem" text DEFAULT '' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "convidados" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer NOT NULL,
	"token" text NOT NULL,
	"nome" text NOT NULL,
	"acompanhantes" text DEFAULT '' NOT NULL,
	"contato" text DEFAULT '' NOT NULL,
	"origem" text DEFAULT '' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "convidados_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"dominio" text NOT NULL,
	"tipo" text DEFAULT 'convite_completo' NOT NULL,
	"tema" text DEFAULT 'oliva' NOT NULL,
	"titulo" text DEFAULT '' NOT NULL,
	"anfitrioes" text DEFAULT '' NOT NULL,
	"data" text DEFAULT '' NOT NULL,
	"hora" text DEFAULT '' NOT NULL,
	"local_nome" text DEFAULT '' NOT NULL,
	"local_endereco" text DEFAULT '' NOT NULL,
	"local_cidade" text DEFAULT '' NOT NULL,
	"local_map_url" text DEFAULT '' NOT NULL,
	"mensagem_convite" text DEFAULT '' NOT NULL,
	"texto_capa" text DEFAULT '' NOT NULL,
	"whatsapp_template" text DEFAULT '' NOT NULL,
	"pix_chave" text DEFAULT '' NOT NULL,
	"pix_nome" text DEFAULT '' NOT NULL,
	"pix_cidade" text DEFAULT '' NOT NULL,
	"mp_access_token_enc" text DEFAULT '' NOT NULL,
	"mp_sandbox" boolean DEFAULT false NOT NULL,
	"mp_taxa_percent" text DEFAULT '5' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "eventos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "eventos_dominio_unique" UNIQUE("dominio")
);
--> statement-breakpoint
CREATE TABLE "presencas" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer NOT NULL,
	"convidado_id" integer NOT NULL,
	"confirmado" boolean NOT NULL,
	"mensagem" text DEFAULT '' NOT NULL,
	"nomes_acompanhantes" text DEFAULT '' NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "presencas_convidado_id_unique" UNIQUE("convidado_id")
);
--> statement-breakpoint
CREATE TABLE "presentes_recebidos" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer NOT NULL,
	"convidado_token" text NOT NULL,
	"convidado_nome" text DEFAULT '' NOT NULL,
	"presente" text NOT NULL,
	"valor" text DEFAULT '' NOT NULL,
	"metodo" text NOT NULL,
	"mp_payment_id" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "presentes_recebidos_mp_payment_id_unique" UNIQUE("mp_payment_id")
);
--> statement-breakpoint
CREATE TABLE "recados" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer NOT NULL,
	"convidado_token" text NOT NULL,
	"nome" text DEFAULT '' NOT NULL,
	"mensagem" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"evento_id" integer,
	"login" text NOT NULL,
	"nome" text DEFAULT '' NOT NULL,
	"senha_hash" text NOT NULL,
	"papel" text DEFAULT 'admin' NOT NULL,
	"trocar_senha" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_login_unique" UNIQUE("login")
);
--> statement-breakpoint
ALTER TABLE "catalogo_presentes" ADD CONSTRAINT "catalogo_presentes_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convidados" ADD CONSTRAINT "convidados_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_convidado_id_convidados_id_fk" FOREIGN KEY ("convidado_id") REFERENCES "public"."convidados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentes_recebidos" ADD CONSTRAINT "presentes_recebidos_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recados" ADD CONSTRAINT "recados_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalogo_evento_nome_uq" ON "catalogo_presentes" USING btree ("evento_id","nome");--> statement-breakpoint
CREATE INDEX "convidados_evento_idx" ON "convidados" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "presencas_evento_idx" ON "presencas" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "presentes_recebidos_evento_idx" ON "presentes_recebidos" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "recados_evento_idx" ON "recados" USING btree ("evento_id");