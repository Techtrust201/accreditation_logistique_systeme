-- CreateEnum
CREATE TYPE "HistoryAction" AS ENUM ('CREATED', 'STATUS_CHANGED', 'VEHICLE_ADDED', 'VEHICLE_REMOVED', 'VEHICLE_UPDATED', 'EMAIL_SENT', 'INFO_UPDATED', 'DELETED');

-- CreateTable
CREATE TABLE "AccreditationHistory" (
    "id" SERIAL NOT NULL,
    "accreditationId" TEXT NOT NULL,
    "action" "HistoryAction" NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccreditationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccreditationHistory" ADD CONSTRAINT "AccreditationHistory_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "Accreditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
