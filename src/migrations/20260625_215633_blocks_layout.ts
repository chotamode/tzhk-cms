import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_content_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_hero_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_about_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "site_content_blocks_gallery_items_locales" (
  	"label" varchar,
  	"tag" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_gallery_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_products_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"price" numeric,
  	"currency" varchar DEFAULT 'RUB',
  	"available" boolean DEFAULT true
  );
  
  CREATE TABLE "site_content_blocks_products_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_products_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_faq_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_reviews_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"rating" numeric
  );
  
  CREATE TABLE "site_content_blocks_reviews_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_reviews_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_content_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_content_blocks_rich_text_locales" (
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_hero_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_about_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_gallery_items_locales" (
  	"label" varchar,
  	"tag" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_gallery_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_products_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"price" numeric,
  	"currency" varchar DEFAULT 'RUB',
  	"available" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_products_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_products_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_faq_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_reviews_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"rating" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_reviews_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_reviews_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_content_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_site_content_v_blocks_rich_text_locales" (
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP TABLE "site_content_portfolio" CASCADE;
  DROP TABLE "site_content_portfolio_locales" CASCADE;
  DROP TABLE "_site_content_v_version_portfolio" CASCADE;
  DROP TABLE "_site_content_v_version_portfolio_locales" CASCADE;
  ALTER TABLE "site_content_blocks_hero" ADD CONSTRAINT "site_content_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_content_blocks_hero" ADD CONSTRAINT "site_content_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_hero_locales" ADD CONSTRAINT "site_content_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_about" ADD CONSTRAINT "site_content_blocks_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_about_locales" ADD CONSTRAINT "site_content_blocks_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_gallery_items" ADD CONSTRAINT "site_content_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_content_blocks_gallery_items" ADD CONSTRAINT "site_content_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_gallery_items_locales" ADD CONSTRAINT "site_content_blocks_gallery_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_gallery" ADD CONSTRAINT "site_content_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_gallery_locales" ADD CONSTRAINT "site_content_blocks_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_products_items" ADD CONSTRAINT "site_content_blocks_products_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_content_blocks_products_items" ADD CONSTRAINT "site_content_blocks_products_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_products_items_locales" ADD CONSTRAINT "site_content_blocks_products_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_products_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_products" ADD CONSTRAINT "site_content_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_products_locales" ADD CONSTRAINT "site_content_blocks_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_faq_items" ADD CONSTRAINT "site_content_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_faq_items_locales" ADD CONSTRAINT "site_content_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_faq" ADD CONSTRAINT "site_content_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_faq_locales" ADD CONSTRAINT "site_content_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_reviews_items" ADD CONSTRAINT "site_content_blocks_reviews_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_reviews_items_locales" ADD CONSTRAINT "site_content_blocks_reviews_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_reviews_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_reviews" ADD CONSTRAINT "site_content_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_reviews_locales" ADD CONSTRAINT "site_content_blocks_reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_rich_text" ADD CONSTRAINT "site_content_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_content_blocks_rich_text_locales" ADD CONSTRAINT "site_content_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_hero" ADD CONSTRAINT "_site_content_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_hero" ADD CONSTRAINT "_site_content_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_hero_locales" ADD CONSTRAINT "_site_content_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_about" ADD CONSTRAINT "_site_content_v_blocks_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_about_locales" ADD CONSTRAINT "_site_content_v_blocks_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_gallery_items" ADD CONSTRAINT "_site_content_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_gallery_items" ADD CONSTRAINT "_site_content_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_gallery_items_locales" ADD CONSTRAINT "_site_content_v_blocks_gallery_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_gallery" ADD CONSTRAINT "_site_content_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_gallery_locales" ADD CONSTRAINT "_site_content_v_blocks_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_products_items" ADD CONSTRAINT "_site_content_v_blocks_products_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_products_items" ADD CONSTRAINT "_site_content_v_blocks_products_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_products_items_locales" ADD CONSTRAINT "_site_content_v_blocks_products_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_products_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_products" ADD CONSTRAINT "_site_content_v_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_products_locales" ADD CONSTRAINT "_site_content_v_blocks_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_faq_items" ADD CONSTRAINT "_site_content_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_faq_items_locales" ADD CONSTRAINT "_site_content_v_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_faq" ADD CONSTRAINT "_site_content_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_faq_locales" ADD CONSTRAINT "_site_content_v_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_reviews_items" ADD CONSTRAINT "_site_content_v_blocks_reviews_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_reviews_items_locales" ADD CONSTRAINT "_site_content_v_blocks_reviews_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_reviews_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_reviews" ADD CONSTRAINT "_site_content_v_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_reviews_locales" ADD CONSTRAINT "_site_content_v_blocks_reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_rich_text" ADD CONSTRAINT "_site_content_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_content_v_blocks_rich_text_locales" ADD CONSTRAINT "_site_content_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_content_blocks_hero_order_idx" ON "site_content_blocks_hero" USING btree ("_order");
  CREATE INDEX "site_content_blocks_hero_parent_id_idx" ON "site_content_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_hero_path_idx" ON "site_content_blocks_hero" USING btree ("_path");
  CREATE INDEX "site_content_blocks_hero_image_idx" ON "site_content_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_content_blocks_hero_locales_locale_parent_id_unique" ON "site_content_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_about_order_idx" ON "site_content_blocks_about" USING btree ("_order");
  CREATE INDEX "site_content_blocks_about_parent_id_idx" ON "site_content_blocks_about" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_about_path_idx" ON "site_content_blocks_about" USING btree ("_path");
  CREATE UNIQUE INDEX "site_content_blocks_about_locales_locale_parent_id_unique" ON "site_content_blocks_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_gallery_items_order_idx" ON "site_content_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "site_content_blocks_gallery_items_parent_id_idx" ON "site_content_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_gallery_items_image_idx" ON "site_content_blocks_gallery_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_content_blocks_gallery_items_locales_locale_parent_id_u" ON "site_content_blocks_gallery_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_gallery_order_idx" ON "site_content_blocks_gallery" USING btree ("_order");
  CREATE INDEX "site_content_blocks_gallery_parent_id_idx" ON "site_content_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_gallery_path_idx" ON "site_content_blocks_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "site_content_blocks_gallery_locales_locale_parent_id_unique" ON "site_content_blocks_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_products_items_order_idx" ON "site_content_blocks_products_items" USING btree ("_order");
  CREATE INDEX "site_content_blocks_products_items_parent_id_idx" ON "site_content_blocks_products_items" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_products_items_image_idx" ON "site_content_blocks_products_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_content_blocks_products_items_locales_locale_parent_id_" ON "site_content_blocks_products_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_products_order_idx" ON "site_content_blocks_products" USING btree ("_order");
  CREATE INDEX "site_content_blocks_products_parent_id_idx" ON "site_content_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_products_path_idx" ON "site_content_blocks_products" USING btree ("_path");
  CREATE UNIQUE INDEX "site_content_blocks_products_locales_locale_parent_id_unique" ON "site_content_blocks_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_faq_items_order_idx" ON "site_content_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "site_content_blocks_faq_items_parent_id_idx" ON "site_content_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_content_blocks_faq_items_locales_locale_parent_id_uniqu" ON "site_content_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_faq_order_idx" ON "site_content_blocks_faq" USING btree ("_order");
  CREATE INDEX "site_content_blocks_faq_parent_id_idx" ON "site_content_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_faq_path_idx" ON "site_content_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "site_content_blocks_faq_locales_locale_parent_id_unique" ON "site_content_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_reviews_items_order_idx" ON "site_content_blocks_reviews_items" USING btree ("_order");
  CREATE INDEX "site_content_blocks_reviews_items_parent_id_idx" ON "site_content_blocks_reviews_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_content_blocks_reviews_items_locales_locale_parent_id_u" ON "site_content_blocks_reviews_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_reviews_order_idx" ON "site_content_blocks_reviews" USING btree ("_order");
  CREATE INDEX "site_content_blocks_reviews_parent_id_idx" ON "site_content_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_reviews_path_idx" ON "site_content_blocks_reviews" USING btree ("_path");
  CREATE UNIQUE INDEX "site_content_blocks_reviews_locales_locale_parent_id_unique" ON "site_content_blocks_reviews_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_content_blocks_rich_text_order_idx" ON "site_content_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "site_content_blocks_rich_text_parent_id_idx" ON "site_content_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "site_content_blocks_rich_text_path_idx" ON "site_content_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "site_content_blocks_rich_text_locales_locale_parent_id_uniqu" ON "site_content_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_hero_order_idx" ON "_site_content_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_hero_parent_id_idx" ON "_site_content_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_hero_path_idx" ON "_site_content_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_site_content_v_blocks_hero_image_idx" ON "_site_content_v_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "_site_content_v_blocks_hero_locales_locale_parent_id_unique" ON "_site_content_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_about_order_idx" ON "_site_content_v_blocks_about" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_about_parent_id_idx" ON "_site_content_v_blocks_about" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_about_path_idx" ON "_site_content_v_blocks_about" USING btree ("_path");
  CREATE UNIQUE INDEX "_site_content_v_blocks_about_locales_locale_parent_id_unique" ON "_site_content_v_blocks_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_gallery_items_order_idx" ON "_site_content_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_gallery_items_parent_id_idx" ON "_site_content_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_gallery_items_image_idx" ON "_site_content_v_blocks_gallery_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "_site_content_v_blocks_gallery_items_locales_locale_parent_i" ON "_site_content_v_blocks_gallery_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_gallery_order_idx" ON "_site_content_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_gallery_parent_id_idx" ON "_site_content_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_gallery_path_idx" ON "_site_content_v_blocks_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "_site_content_v_blocks_gallery_locales_locale_parent_id_uniq" ON "_site_content_v_blocks_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_products_items_order_idx" ON "_site_content_v_blocks_products_items" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_products_items_parent_id_idx" ON "_site_content_v_blocks_products_items" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_products_items_image_idx" ON "_site_content_v_blocks_products_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "_site_content_v_blocks_products_items_locales_locale_parent_" ON "_site_content_v_blocks_products_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_products_order_idx" ON "_site_content_v_blocks_products" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_products_parent_id_idx" ON "_site_content_v_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_products_path_idx" ON "_site_content_v_blocks_products" USING btree ("_path");
  CREATE UNIQUE INDEX "_site_content_v_blocks_products_locales_locale_parent_id_uni" ON "_site_content_v_blocks_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_faq_items_order_idx" ON "_site_content_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_faq_items_parent_id_idx" ON "_site_content_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_content_v_blocks_faq_items_locales_locale_parent_id_un" ON "_site_content_v_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_faq_order_idx" ON "_site_content_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_faq_parent_id_idx" ON "_site_content_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_faq_path_idx" ON "_site_content_v_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "_site_content_v_blocks_faq_locales_locale_parent_id_unique" ON "_site_content_v_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_reviews_items_order_idx" ON "_site_content_v_blocks_reviews_items" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_reviews_items_parent_id_idx" ON "_site_content_v_blocks_reviews_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_content_v_blocks_reviews_items_locales_locale_parent_i" ON "_site_content_v_blocks_reviews_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_reviews_order_idx" ON "_site_content_v_blocks_reviews" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_reviews_parent_id_idx" ON "_site_content_v_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_reviews_path_idx" ON "_site_content_v_blocks_reviews" USING btree ("_path");
  CREATE UNIQUE INDEX "_site_content_v_blocks_reviews_locales_locale_parent_id_uniq" ON "_site_content_v_blocks_reviews_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_content_v_blocks_rich_text_order_idx" ON "_site_content_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_site_content_v_blocks_rich_text_parent_id_idx" ON "_site_content_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_site_content_v_blocks_rich_text_path_idx" ON "_site_content_v_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_site_content_v_blocks_rich_text_locales_locale_parent_id_un" ON "_site_content_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "site_content_locales" DROP COLUMN "hero_title";
  ALTER TABLE "site_content_locales" DROP COLUMN "hero_subtitle";
  ALTER TABLE "site_content_locales" DROP COLUMN "about_heading";
  ALTER TABLE "site_content_locales" DROP COLUMN "about_body";
  ALTER TABLE "site_content_locales" DROP COLUMN "cta_label";
  ALTER TABLE "_site_content_v_locales" DROP COLUMN "version_hero_title";
  ALTER TABLE "_site_content_v_locales" DROP COLUMN "version_hero_subtitle";
  ALTER TABLE "_site_content_v_locales" DROP COLUMN "version_about_heading";
  ALTER TABLE "_site_content_v_locales" DROP COLUMN "version_about_body";
  ALTER TABLE "_site_content_v_locales" DROP COLUMN "version_cta_label";
  DROP TYPE "public"."enum_site_content_portfolio_category";
  DROP TYPE "public"."enum__site_content_v_version_portfolio_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  
  DROP TABLE "site_content_blocks_hero" CASCADE;
  DROP TABLE "site_content_blocks_hero_locales" CASCADE;
  DROP TABLE "site_content_blocks_about" CASCADE;
  DROP TABLE "site_content_blocks_about_locales" CASCADE;
  DROP TABLE "site_content_blocks_gallery_items" CASCADE;
  DROP TABLE "site_content_blocks_gallery_items_locales" CASCADE;
  DROP TABLE "site_content_blocks_gallery" CASCADE;
  DROP TABLE "site_content_blocks_gallery_locales" CASCADE;
  DROP TABLE "site_content_blocks_products_items" CASCADE;
  DROP TABLE "site_content_blocks_products_items_locales" CASCADE;
  DROP TABLE "site_content_blocks_products" CASCADE;
  DROP TABLE "site_content_blocks_products_locales" CASCADE;
  DROP TABLE "site_content_blocks_faq_items" CASCADE;
  DROP TABLE "site_content_blocks_faq_items_locales" CASCADE;
  DROP TABLE "site_content_blocks_faq" CASCADE;
  DROP TABLE "site_content_blocks_faq_locales" CASCADE;
  DROP TABLE "site_content_blocks_reviews_items" CASCADE;
  DROP TABLE "site_content_blocks_reviews_items_locales" CASCADE;
  DROP TABLE "site_content_blocks_reviews" CASCADE;
  DROP TABLE "site_content_blocks_reviews_locales" CASCADE;
  DROP TABLE "site_content_blocks_rich_text" CASCADE;
  DROP TABLE "site_content_blocks_rich_text_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_hero" CASCADE;
  DROP TABLE "_site_content_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_about" CASCADE;
  DROP TABLE "_site_content_v_blocks_about_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_site_content_v_blocks_gallery_items_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_gallery" CASCADE;
  DROP TABLE "_site_content_v_blocks_gallery_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_products_items" CASCADE;
  DROP TABLE "_site_content_v_blocks_products_items_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_products" CASCADE;
  DROP TABLE "_site_content_v_blocks_products_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_faq_items" CASCADE;
  DROP TABLE "_site_content_v_blocks_faq_items_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_faq" CASCADE;
  DROP TABLE "_site_content_v_blocks_faq_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_reviews_items" CASCADE;
  DROP TABLE "_site_content_v_blocks_reviews_items_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_reviews" CASCADE;
  DROP TABLE "_site_content_v_blocks_reviews_locales" CASCADE;
  DROP TABLE "_site_content_v_blocks_rich_text" CASCADE;
  DROP TABLE "_site_content_v_blocks_rich_text_locales" CASCADE;
  ALTER TABLE "site_content_locales" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "site_content_locales" ADD COLUMN "hero_subtitle" varchar;
  ALTER TABLE "site_content_locales" ADD COLUMN "about_heading" varchar;
  ALTER TABLE "site_content_locales" ADD COLUMN "about_body" jsonb;
  ALTER TABLE "site_content_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_site_content_v_locales" ADD COLUMN "version_hero_title" varchar;
  ALTER TABLE "_site_content_v_locales" ADD COLUMN "version_hero_subtitle" varchar;
  ALTER TABLE "_site_content_v_locales" ADD COLUMN "version_about_heading" varchar;
  ALTER TABLE "_site_content_v_locales" ADD COLUMN "version_about_body" jsonb;
  ALTER TABLE "_site_content_v_locales" ADD COLUMN "version_cta_label" varchar;
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
  CREATE UNIQUE INDEX "_site_content_v_version_portfolio_locales_locale_parent_id_u" ON "_site_content_v_version_portfolio_locales" USING btree ("_locale","_parent_id");`)
}
