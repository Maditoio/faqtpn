-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROPERTY_UNAVAILABLE', 'PROPERTY_APPROVED', 'PROPERTY_REJECTED', 'PRICE_DROP', 'NEW_PROPERTY_LOCATION', 'PROPERTY_AVAILABLE', 'INFO');

-- AlterTable: Add temporary column
ALTER TABLE "notifications" ADD COLUMN "type_new" "NotificationType" DEFAULT 'INFO';

-- Migrate existing data
UPDATE "notifications" SET "type_new" = 'PROPERTY_UNAVAILABLE' WHERE "type" = 'PROPERTY_UNAVAILABLE';
UPDATE "notifications" SET "type_new" = 'INFO' WHERE "type" = 'INFO' OR "type" NOT IN ('PROPERTY_UNAVAILABLE');

-- Drop old column and rename new one
ALTER TABLE "notifications" DROP COLUMN "type";
ALTER TABLE "notifications" RENAME COLUMN "type_new" TO "type";

-- Set NOT NULL constraint  
ALTER TABLE "notifications" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'INFO';
