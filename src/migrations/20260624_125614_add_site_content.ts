import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_content_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_content_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_content_v_published_locale" AS ENUM('en', 'cs', 'ru');
  CREATE TABLE "site_content_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "site_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"internal_title" varchar DEFAULT 'Homepage',
  	"contacts_telegram" varchar,
  	"contacts_whatsapp" varchar,
  	"contacts_email" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_site_content_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "site_content_locales" (
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"about_heading" varchar,
  	"about_body" jsonb,
  	"cta_label" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_version_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_content_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_internal_title" varchar DEFAULT 'Homepage',
  	"version_contacts_telegram" varchar,
  	"version_contacts_whatsapp" varchar,
  	"version_contacts_email" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__site_content_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__site_content_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_content_v_locales" (
  	"version_hero_title" varchar,
  	"version_hero_subtitle" varchar,
  	"version_about_heading" varchar,
  	"version_about_body" jsonb,
  	"version_cta_label" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_content_id" integer;
  ALTER TABLE "site_content_socials" ADD CONSTRAINT "site_content_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content" ADD CONSTRAINT "site_content_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_content" ADD CONSTRAINT "site_content_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_content_locales" ADD CONSTRAINT "site_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_version_socials" ADD CONSTRAINT "_site_content_v_version_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_parent_id_site_content_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_content"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v_locales" ADD CONSTRAINT "_site_content_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_content_socials_order_idx" ON "site_content_socials" USING btree ("_order");
  CREATE INDEX "site_content_socials_parent_id_idx" ON "site_content_socials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_content_tenant_idx" ON "site_content" USING btree ("tenant_id");
  CREATE INDEX "site_content_seo_seo_og_image_idx" ON "site_content" USING btree ("seo_og_image_id");
  CREATE INDEX "site_content_updated_at_idx" ON "site_content" USING btree ("updated_at");
  CREATE INDEX "site_content_created_at_idx" ON "site_content" USING btree ("created_at");
  CREATE INDEX "site_content__status_idx" ON "site_content" USING btree ("_status");
  CREATE UNIQUE INDEX "site_content_locales_locale_parent_id_unique" ON "site_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_version_socials_order_idx" ON "_site_content_v_version_socials" USING btree ("_order");
  CREATE INDEX "_site_content_v_version_socials_parent_id_idx" ON "_site_content_v_version_socials" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_parent_idx" ON "_site_content_v" USING btree ("parent_id");
  CREATE INDEX "_site_content_v_version_version_tenant_idx" ON "_site_content_v" USING btree ("version_tenant_id");
  CREATE INDEX "_site_content_v_version_seo_version_seo_og_image_idx" ON "_site_content_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_site_content_v_version_version_updated_at_idx" ON "_site_content_v" USING btree ("version_updated_at");
  CREATE INDEX "_site_content_v_version_version_created_at_idx" ON "_site_content_v" USING btree ("version_created_at");
  CREATE INDEX "_site_content_v_version_version__status_idx" ON "_site_content_v" USING btree ("version__status");
  CREATE INDEX "_site_content_v_created_at_idx" ON "_site_content_v" USING btree ("created_at");
  CREATE INDEX "_site_content_v_updated_at_idx" ON "_site_content_v" USING btree ("updated_at");
  CREATE INDEX "_site_content_v_snapshot_idx" ON "_site_content_v" USING btree ("snapshot");
  CREATE INDEX "_site_content_v_published_locale_idx" ON "_site_content_v" USING btree ("published_locale");
  CREATE INDEX "_site_content_v_latest_idx" ON "_site_content_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_site_content_v_locales_locale_parent_id_unique" ON "_site_content_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_content_fk" FOREIGN KEY ("site_content_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_site_content_id_idx" ON "payload_locked_documents_rels" USING btree ("site_content_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_content_socials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_content_v_version_socials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_content_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_content_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_content_socials" CASCADE;
  DROP TABLE "site_content" CASCADE;
  DROP TABLE "site_content_locales" CASCADE;
  DROP TABLE "_site_content_v_version_socials" CASCADE;
  DROP TABLE "_site_content_v" CASCADE;
  DROP TABLE "_site_content_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_content_fk";
  
  DROP INDEX "payload_locked_documents_rels_site_content_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_content_id";
  DROP TYPE "public"."enum_site_content_status";
  DROP TYPE "public"."enum__site_content_v_version_status";
  DROP TYPE "public"."enum__site_content_v_published_locale";`)
}
