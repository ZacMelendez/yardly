-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "estimateId" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
