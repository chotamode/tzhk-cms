import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_content_blocks_gallery_source" AS ENUM('curated', 'byTags');
  CREATE TYPE "public"."enum__site_content_v_blocks_gallery_source" AS ENUM('curated', 'byTags');
  CREATE TYPE "public"."enum_tags_kind" AS ENUM('category', 'material', 'colour', 'technique', 'other');
  CREATE TABLE "site_content_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_site_content_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"kind" "enum_tags_kind" DEFAULT 'category',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "site_content_blocks_gallery" ADD COLUMN "source" "enum_site_content_blocks_gallery_source" DEFAULT 'curated';
  ALTER TABLE "site_content_blocks_gallery" ADD COLUMN "limit" numeric DEFAULT 24;
  ALTER TABLE "_site_content_v_blocks_gallery" ADD COLUMN "source" "enum__site_content_v_blocks_gallery_source" DEFAULT 'curated';
  ALTER TABLE "_site_content_v_blocks_gallery" ADD COLUMN "limit" numeric DEFAULT 24;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "site_content_rels" ADD CONSTRAINT "site_content_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_rels" ADD CONSTRAINT "site_content_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_rels" ADD CONSTRAINT "_site_content_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_rels" ADD CONSTRAINT "_site_content_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags_locales" ADD CONSTRAINT "tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_content_rels_order_idx" ON "site_content_rels" USING btree ("order");
  CREATE INDEX "site_content_rels_parent_idx" ON "site_content_rels" USING btree ("parent_id");
  CREATE INDEX "site_content_rels_path_idx" ON "site_content_rels" USING btree ("path");
  CREATE INDEX "site_content_rels_tags_id_idx" ON "site_content_rels" USING btree ("tags_id");
  CREATE INDEX "_site_content_v_rels_order_idx" ON "_site_content_v_rels" USING btree ("order");
  CREATE INDEX "_site_content_v_rels_parent_idx" ON "_site_content_v_rels" USING btree ("parent_id");
  CREATE INDEX "_site_content_v_rels_path_idx" ON "_site_content_v_rels" USING btree ("path");
  CREATE INDEX "_site_content_v_rels_tags_id_idx" ON "_site_content_v_rels" USING btree ("tags_id");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_tags_id_idx" ON "media_rels" USING btree ("tags_id");
  CREATE INDEX "tags_tenant_idx" ON "tags" USING btree ("tenant_id");
  CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_locales_locale_parent_id_unique" ON "tags_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  ALTER TABLE "site_content_blocks_gallery_items_locales" DROP COLUMN "tag";
  ALTER TABLE "_site_content_v_blocks_gallery_items_locales" DROP COLUMN "tag";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_content_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_content_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tags_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_content_rels" CASCADE;
  DROP TABLE "_site_content_v_rels" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  ALTER TABLE "site_content_blocks_gallery_items_locales" ADD COLUMN "tag" varchar;
  ALTER TABLE "_site_content_v_blocks_gallery_items_locales" ADD COLUMN "tag" varchar;
  ALTER TABLE "site_content_blocks_gallery" DROP COLUMN "source";
  ALTER TABLE "site_content_blocks_gallery" DROP COLUMN "limit";
  ALTER TABLE "_site_content_v_blocks_gallery" DROP COLUMN "source";
  ALTER TABLE "_site_content_v_blocks_gallery" DROP COLUMN "limit";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  DROP TYPE "public"."enum_site_content_blocks_gallery_source";
  DROP TYPE "public"."enum__site_content_v_blocks_gallery_source";
  DROP TYPE "public"."enum_tags_kind";`)
}
