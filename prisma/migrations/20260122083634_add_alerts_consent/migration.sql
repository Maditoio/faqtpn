-- AlterTable
ALTER TABLE "users" ADD COLUMN     "alerts_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alerts_consent_date" TIMESTAMP(3);
