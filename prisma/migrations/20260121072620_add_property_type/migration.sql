-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'TOWNHOUSE', 'COTTAGE', 'BACKROOM', 'WAREHOUSE', 'INDUSTRIAL_PROPERTY', 'COMMERCIAL_PROPERTY');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "property_type" "PropertyType" NOT NULL DEFAULT 'APARTMENT';

-- CreateIndex
CREATE INDEX "properties_property_type_idx" ON "properties"("property_type");
