import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_content_portfolio_category" AS ENUM('ornamental', 'lineWork', 'abstract', 'whipShading', 'freehand');
  CREATE TYPE "public"."enum__site_content_v_version_portfolio_category" AS ENUM('ornamental', 'lineWork', 'abstract', 'whipShading', 'freehand');
  CREATE TABLE "site_content_portfolio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"category" "enum_site_content_portfolio_category"
  );
  
  CREATE TABLE "site_content_portfolio_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_site_content_v_version_portfolio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"category" "enum__site_content_v_version_portfolio_category",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_content_v_version_portfolio_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "portfolio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portfolio_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "portfolio" CASCADE;
  DROP TABLE "portfolio_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_portfolio_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_portfolio_id_idx";
  ALTER TABLE "site_content_portfolio" ADD CONSTRAINT "site_content_portfolio_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_content_portfolio" ADD CONSTRAINT "site_content_portfolio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_portfolio_locales" ADD CONSTRAINT "site_content_portfolio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_version_portfolio" ADD CONSTRAINT "_site_content_v_version_portfolio_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v_version_portfolio" ADD CONSTRAINT "_site_content_v_version_portfolio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_version_portfolio_locales" ADD CONSTRAINT "_site_content_v_version_portfolio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_version_portfolio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_content_portfolio_order_idx" ON "site_content_portfolio" USING btree ("_order");
  CREATE INDEX "site_content_portfolio_parent_id_idx" ON "site_content_portfolio" USING btree ("_parent_id");
  CREATE INDEX "site_content_portfolio_image_idx" ON "site_content_portfolio" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_content_portfolio_locales_locale_parent_id_unique" ON "site_content_portfolio_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_version_portfolio_order_idx" ON "_site_content_v_version_portfolio" USING btree ("_order");
  CREATE INDEX "_site_content_v_version_portfolio_parent_id_idx" ON "_site_content_v_version_portfolio" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_version_portfolio_image_idx" ON "_site_content_v_version_portfolio" USING btree ("image_id");
  CREATE UNIQUE INDEX "_site_content_v_version_portfolio_locales_locale_parent_id_u" ON "_site_content_v_version_portfolio_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "portfolio_id";
  DROP TYPE "public"."enum_portfolio_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_portfolio_category" AS ENUM('ornamental', 'lineWork', 'abstract', 'whipShading', 'freehand');
  CREATE TABLE "portfolio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"image_id" integer NOT NULL,
  	"category" "enum_portfolio_category",
  	"sort" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "portfolio_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "site_content_portfolio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_content_portfolio_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_content_v_version_portfolio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_content_v_version_portfolio_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_content_portfolio" CASCADE;
  DROP TABLE "site_content_portfolio_locales" CASCADE;
  DROP TABLE "_site_content_v_version_portfolio" CASCADE;
  DROP TABLE "_site_content_v_version_portfolio_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "portfolio_id" integer;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio_locales" ADD CONSTRAINT "portfolio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "portfolio_tenant_idx" ON "portfolio" USING btree ("tenant_id");
  CREATE INDEX "portfolio_image_idx" ON "portfolio" USING btree ("image_id");
  CREATE INDEX "portfolio_updated_at_idx" ON "portfolio" USING btree ("updated_at");
  CREATE INDEX "portfolio_created_at_idx" ON "portfolio" USING btree ("created_at");
  CREATE UNIQUE INDEX "portfolio_locales_locale_parent_id_unique" ON "portfolio_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_portfolio_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_id");
  DROP TYPE "public"."enum_site_content_portfolio_category";
  DROP TYPE "public"."enum__site_content_v_version_portfolio_category";`)
}
