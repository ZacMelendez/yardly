-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentJobId" TEXT,
ADD COLUMN     "recurrenceEnd" TIMESTAMP(3),
ADD COLUMN     "recurrenceRule" JSONB;

-- CreateIndex
CREATE INDEX "Job_userId_date_idx" ON "Job"("userId", "date");

-- CreateIndex
CREATE INDEX "Job_parentJobId_idx" ON "Job"("parentJobId");

-- CreateIndex
CREATE INDEX "Job_isRecurring_idx" ON "Job"("isRecurring");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_parentJobId_fkey" FOREIGN KEY ("parentJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
