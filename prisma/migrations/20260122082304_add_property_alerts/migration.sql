-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ALERT_MATCH';

-- CreateTable
CREATE TABLE "property_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "propertyType" "PropertyType",
    "minPrice" DECIMAL(10,2),
    "maxPrice" DECIMAL(10,2),
    "minBedrooms" INTEGER,
    "minBathrooms" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notify_email" BOOLEAN NOT NULL DEFAULT true,
    "notify_in_app" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered" TIMESTAMP(3),
    "match_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_alerts_user_id_idx" ON "property_alerts"("user_id");

-- CreateIndex
CREATE INDEX "property_alerts_is_active_idx" ON "property_alerts"("is_active");

-- CreateIndex
CREATE INDEX "property_alerts_location_idx" ON "property_alerts"("location");

-- AddForeignKey
ALTER TABLE "property_alerts" ADD CONSTRAINT "property_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
