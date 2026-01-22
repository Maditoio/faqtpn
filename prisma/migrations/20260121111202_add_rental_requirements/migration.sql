-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "bank_statements_months" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "deposit_months" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "electricity_prepaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "water_prepaid" BOOLEAN NOT NULL DEFAULT false;
