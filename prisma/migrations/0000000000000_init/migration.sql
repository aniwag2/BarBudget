-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('base_spirit', 'essential_liqueur', 'supplemental', 'mixer', 'tool');

-- CreateEnum
CREATE TYPE "BudgetTier" AS ENUM ('budget', 'mid', 'premium');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('feed', 'manual');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "description" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bottles" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "abv" DECIMAL(5,2),
    "size_ml" INTEGER,
    "cocktaildb_ingredient_name" TEXT,
    "expert_score" DECIMAL(3,1),
    "expert_summary" TEXT,
    "source_links" JSONB,
    "price_low" DECIMAL(10,2),
    "price_high" DECIMAL(10,2),
    "price_source" "PriceSource" NOT NULL DEFAULT 'manual',
    "price_updated_at" TIMESTAMP(3),
    "budget_tier" "BudgetTier" NOT NULL DEFAULT 'mid',
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bottles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_links" (
    "id" SERIAL NOT NULL,
    "bottle_id" INTEGER NOT NULL,
    "retailer_name" TEXT NOT NULL,
    "affiliate_network" TEXT,
    "url" TEXT NOT NULL,
    "tracking_id" TEXT,
    "is_affiliate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "affiliate_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_feed_items" (
    "id" SERIAL NOT NULL,
    "retailer_name" TEXT NOT NULL,
    "feed_product_name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "product_url" TEXT NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matched_bottle_id" INTEGER,
    "match_score" DECIMAL(4,3),

    CONSTRAINT "price_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_cache" (
    "ingredient_name" TEXT NOT NULL,
    "is_alcoholic" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "abv" DECIMAL(5,2),
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_cache_pkey" PRIMARY KEY ("ingredient_name")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "bottle_id" INTEGER NOT NULL,
    "score" DECIMAL(3,1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cocktail_api_cache" (
    "cache_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cocktail_api_cache_pkey" PRIMARY KEY ("cache_key")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "bottles_category_id_idx" ON "bottles"("category_id");

-- CreateIndex
CREATE INDEX "bottles_budget_tier_idx" ON "bottles"("budget_tier");

-- CreateIndex
CREATE INDEX "bottles_trending_idx" ON "bottles"("trending");

-- CreateIndex
CREATE INDEX "bottles_cocktaildb_ingredient_name_idx" ON "bottles"("cocktaildb_ingredient_name");

-- CreateIndex
CREATE INDEX "affiliate_links_bottle_id_idx" ON "affiliate_links"("bottle_id");

-- CreateIndex
CREATE INDEX "price_feed_items_matched_bottle_id_idx" ON "price_feed_items"("matched_bottle_id");

-- CreateIndex
CREATE INDEX "price_feed_items_fetched_at_idx" ON "price_feed_items"("fetched_at");

-- CreateIndex
CREATE INDEX "ratings_bottle_id_idx" ON "ratings"("bottle_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_bottle_id_session_id_key" ON "ratings"("bottle_id", "session_id");

-- CreateIndex
CREATE INDEX "cocktail_api_cache_fetched_at_idx" ON "cocktail_api_cache"("fetched_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_bottle_id_fkey" FOREIGN KEY ("bottle_id") REFERENCES "bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_feed_items" ADD CONSTRAINT "price_feed_items_matched_bottle_id_fkey" FOREIGN KEY ("matched_bottle_id") REFERENCES "bottles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_bottle_id_fkey" FOREIGN KEY ("bottle_id") REFERENCES "bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

