-- CreateEnum
CREATE TYPE "AccreditationStatus" AS ENUM ('ATTENTE', 'ENTREE', 'SORTIE', 'NOUVEAU', 'REFUS', 'ABSENT');

-- CreateTable
CREATE TABLE "Accreditation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company" TEXT NOT NULL,
    "stand" TEXT NOT NULL,
    "unloading" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" "AccreditationStatus" NOT NULL DEFAULT 'ATTENTE',
    "entryAt" TIMESTAMP(3),
    "exitAt" TIMESTAMP(3),

    CONSTRAINT "Accreditation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "phoneCode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "unloading" TEXT NOT NULL,
    "kms" TEXT,
    "accreditationId" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "Accreditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AccreditationEmailHistory" (
    "id" SERIAL PRIMARY KEY,
    "accreditationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccreditationEmailHistory_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "Accreditation"("id") ON DELETE CASCADE
);
