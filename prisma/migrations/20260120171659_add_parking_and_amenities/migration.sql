-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "amenities" JSONB,
ADD COLUMN     "parking_spaces" INTEGER NOT NULL DEFAULT 0;
