-- AlterTable
ALTER TABLE "EstimateItem" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "description" DROP NOT NULL;
