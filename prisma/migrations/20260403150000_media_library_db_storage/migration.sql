-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'PDF', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL,
  "status" "MediaStatus" NOT NULL DEFAULT 'ACTIVE',
  "original_name" TEXT,
  "mime_type" TEXT,
  "size_bytes" INTEGER,
  "sha256" TEXT,
  "blob_data" BYTEA,
  "youtube_url" TEXT,
  "uploaded_by_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaUsage" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "field_path" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAsset_kind_created_at_idx" ON "MediaAsset"("kind", "created_at");
CREATE INDEX "MediaAsset_status_created_at_idx" ON "MediaAsset"("status", "created_at");
CREATE INDEX "MediaAsset_uploaded_by_user_id_created_at_idx" ON "MediaAsset"("uploaded_by_user_id", "created_at");
CREATE INDEX "MediaAsset_sha256_idx" ON "MediaAsset"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "MediaUsage_entity_type_entity_id_field_path_key"
ON "MediaUsage"("entity_type", "entity_id", "field_path");
CREATE INDEX "MediaUsage_asset_id_created_at_idx" ON "MediaUsage"("asset_id", "created_at");
CREATE INDEX "MediaUsage_entity_type_entity_id_idx" ON "MediaUsage"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "MediaAsset"
ADD CONSTRAINT "MediaAsset_uploaded_by_user_id_fkey"
FOREIGN KEY ("uploaded_by_user_id") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUsage"
ADD CONSTRAINT "MediaUsage_asset_id_fkey"
FOREIGN KEY ("asset_id") REFERENCES "MediaAsset"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
