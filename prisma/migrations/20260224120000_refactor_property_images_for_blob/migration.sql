-- Rename legacy image columns to Blob-oriented naming
ALTER TABLE "property_images" RENAME COLUMN "url" TO "image_url";
ALTER TABLE "property_images" RENAME COLUMN "is_primary" TO "is_featured";

-- Remove unused metadata column
ALTER TABLE "property_images" DROP COLUMN IF EXISTS "alt_text";
