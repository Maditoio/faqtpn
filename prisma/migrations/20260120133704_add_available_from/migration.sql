-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "available_from" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "properties_available_from_idx" ON "properties"("available_from");
