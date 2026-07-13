import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "portfolio_texts_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"t" varchar NOT NULL,
  	"d" varchar NOT NULL
  );
  
  CREATE TABLE "portfolio_texts_services_academic_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "portfolio_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "portfolio_texts_locales" (
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"hero_lead" varchar,
  	"hero_headline" varchar,
  	"hero_sub" varchar,
  	"hero_cta" varchar,
  	"work_title" varchar,
  	"work_subtitle" varchar,
  	"services_title" varchar,
  	"services_academic_title" varchar,
  	"services_academic_lead" varchar,
  	"contact_title" varchar,
  	"contact_lead" varchar,
  	"footer_tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "portfolio_texts_id" integer;
  ALTER TABLE "portfolio_texts_services_items" ADD CONSTRAINT "portfolio_texts_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_texts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_texts_services_academic_items" ADD CONSTRAINT "portfolio_texts_services_academic_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_texts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_texts" ADD CONSTRAINT "portfolio_texts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio_texts_locales" ADD CONSTRAINT "portfolio_texts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_texts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "portfolio_texts_services_items_order_idx" ON "portfolio_texts_services_items" USING btree ("_order");
  CREATE INDEX "portfolio_texts_services_items_parent_id_idx" ON "portfolio_texts_services_items" USING btree ("_parent_id");
  CREATE INDEX "portfolio_texts_services_items_locale_idx" ON "portfolio_texts_services_items" USING btree ("_locale");
  CREATE INDEX "portfolio_texts_services_academic_items_order_idx" ON "portfolio_texts_services_academic_items" USING btree ("_order");
  CREATE INDEX "portfolio_texts_services_academic_items_parent_id_idx" ON "portfolio_texts_services_academic_items" USING btree ("_parent_id");
  CREATE INDEX "portfolio_texts_services_academic_items_locale_idx" ON "portfolio_texts_services_academic_items" USING btree ("_locale");
  CREATE UNIQUE INDEX "portfolio_texts_tenant_idx" ON "portfolio_texts" USING btree ("tenant_id");
  CREATE INDEX "portfolio_texts_updated_at_idx" ON "portfolio_texts" USING btree ("updated_at");
  CREATE INDEX "portfolio_texts_created_at_idx" ON "portfolio_texts" USING btree ("created_at");
  CREATE UNIQUE INDEX "portfolio_texts_locales_locale_parent_id_unique" ON "portfolio_texts_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_texts_fk" FOREIGN KEY ("portfolio_texts_id") REFERENCES "public"."portfolio_texts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_portfolio_texts_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_texts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "portfolio_texts_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portfolio_texts_services_academic_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portfolio_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portfolio_texts_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "portfolio_texts_services_items" CASCADE;
  DROP TABLE "portfolio_texts_services_academic_items" CASCADE;
  DROP TABLE "portfolio_texts" CASCADE;
  DROP TABLE "portfolio_texts_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_portfolio_texts_fk";
  
  DROP INDEX "payload_locked_documents_rels_portfolio_texts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "portfolio_texts_id";`)
}
