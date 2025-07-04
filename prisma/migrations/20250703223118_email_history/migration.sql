-- DropForeignKey
ALTER TABLE "AccreditationEmailHistory" DROP CONSTRAINT "AccreditationEmailHistory_accreditationId_fkey";

-- AddForeignKey
ALTER TABLE "AccreditationEmailHistory" ADD CONSTRAINT "AccreditationEmailHistory_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "Accreditation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
