-- Add tags column for media classification/search
ALTER TABLE "MediaAsset"
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
