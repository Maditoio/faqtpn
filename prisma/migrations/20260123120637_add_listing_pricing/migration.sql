-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "listing_plan" TEXT DEFAULT 'basic',
ADD COLUMN     "listing_price" DECIMAL(10,2) DEFAULT 49.00,
ADD COLUMN     "max_images" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_status" TEXT DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "properties_payment_status_idx" ON "properties"("payment_status");

-- CreateIndex
CREATE INDEX "properties_expires_at_idx" ON "properties"("expires_at");
