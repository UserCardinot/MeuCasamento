import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const eventos = pgTable("eventos", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  /** Host completo (ex.: convite-henry.lumensoft.com.br). */
  dominio: text("dominio").notNull().unique(),
  /** convite_completo | so_presentes */
  tipo: text("tipo").notNull().default("convite_completo"),
  /** mickey | oliva */
  tema: text("tema").notNull().default("oliva"),
  titulo: text("titulo").notNull().default(""),
  /** Nome(s) em destaque: "Henry" ou "Ediane & Fulano". */
  anfitrioes: text("anfitrioes").notNull().default(""),
  /** YYYY-MM-DD */
  data: text("data").notNull().default(""),
  /** HH:MM */
  hora: text("hora").notNull().default(""),
  localNome: text("local_nome").notNull().default(""),
  localEndereco: text("local_endereco").notNull().default(""),
  localCidade: text("local_cidade").notNull().default(""),
  localMapUrl: text("local_map_url").notNull().default(""),
  mensagemConvite: text("mensagem_convite").notNull().default(""),
  textoCapa: text("texto_capa").notNull().default(""),
  /** Placeholders: {nome} {link} {data} {titulo} {dias} */
  whatsappTemplate: text("whatsapp_template").notNull().default(""),
  pixChave: text("pix_chave").notNull().default(""),
  pixNome: text("pix_nome").notNull().default(""),
  pixCidade: text("pix_cidade").notNull().default(""),
  /** Access token do Mercado Pago cifrado (AES-256-GCM). */
  mpAccessTokenEnc: text("mp_access_token_enc").notNull().default(""),
  mpSandbox: boolean("mp_sandbox").notNull().default(false),
  mpTaxaPercent: text("mp_taxa_percent").notNull().default("5"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  /** null para super admin. */
  eventoId: integer("evento_id").references(() => eventos.id, { onDelete: "cascade" }),
  login: text("login").notNull().unique(),
  nome: text("nome").notNull().default(""),
  senhaHash: text("senha_hash").notNull(),
  /** super | admin */
  papel: text("papel").notNull().default("admin"),
  trocarSenha: boolean("trocar_senha").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const convidados = pgTable(
  "convidados",
  {
    id: serial("id").primaryKey(),
    eventoId: integer("evento_id")
      .notNull()
      .references(() => eventos.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    nome: text("nome").notNull(),
    acompanhantes: text("acompanhantes").notNull().default(""),
    contato: text("contato").notNull().default(""),
    origem: text("origem").notNull().default(""),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("convidados_evento_idx").on(t.eventoId)]
);

export const presencas = pgTable(
  "presencas",
  {
    id: serial("id").primaryKey(),
    eventoId: integer("evento_id")
      .notNull()
      .references(() => eventos.id, { onDelete: "cascade" }),
    convidadoId: integer("convidado_id")
      .notNull()
      .unique()
      .references(() => convidados.id, { onDelete: "cascade" }),
    confirmado: boolean("confirmado").notNull(),
    mensagem: text("mensagem").notNull().default(""),
    nomesAcompanhantes: text("nomes_acompanhantes").notNull().default(""),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("presencas_evento_idx").on(t.eventoId)]
);

export const catalogoPresentes = pgTable(
  "catalogo_presentes",
  {
    id: serial("id").primaryKey(),
    eventoId: integer("evento_id")
      .notNull()
      .references(() => eventos.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    /** Texto livre como no formulário (ex.: "199,90"). */
    preco: text("preco").notNull().default(""),
    url: text("url").notNull().default(""),
    imagem: text("imagem").notNull().default(""),
    ativo: boolean("ativo").notNull().default(true),
    ordem: integer("ordem").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("catalogo_evento_nome_uq").on(t.eventoId, t.nome)]
);

export const presentesRecebidos = pgTable(
  "presentes_recebidos",
  {
    id: serial("id").primaryKey(),
    eventoId: integer("evento_id")
      .notNull()
      .references(() => eventos.id, { onDelete: "cascade" }),
    /** Sem FK: o histórico sobrevive à exclusão do convidado. */
    convidadoToken: text("convidado_token").notNull(),
    convidadoNome: text("convidado_nome").notNull().default(""),
    presente: text("presente").notNull(),
    valor: text("valor").notNull().default(""),
    /** pix | cartao */
    metodo: text("metodo").notNull(),
    mpPaymentId: text("mp_payment_id").unique(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("presentes_recebidos_evento_idx").on(t.eventoId)]
);

export const recados = pgTable(
  "recados",
  {
    id: serial("id").primaryKey(),
    eventoId: integer("evento_id")
      .notNull()
      .references(() => eventos.id, { onDelete: "cascade" }),
    convidadoToken: text("convidado_token").notNull(),
    nome: text("nome").notNull().default(""),
    mensagem: text("mensagem").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("recados_evento_idx").on(t.eventoId)]
);

export type Evento = typeof eventos.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
export type Convidado = typeof convidados.$inferSelect;
export type Presenca = typeof presencas.$inferSelect;
export type CatalogoPresente = typeof catalogoPresentes.$inferSelect;
export type PresenteRecebido = typeof presentesRecebidos.$inferSelect;
export type Recado = typeof recados.$inferSelect;
