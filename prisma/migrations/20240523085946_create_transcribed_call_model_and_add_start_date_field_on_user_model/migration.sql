-- AlterTable
ALTER TABLE "User" ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "transcribedCall" (
    "id" SERIAL NOT NULL,
    "crmId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "qualityPercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "transcribedCall_pkey" PRIMARY KEY ("id")
);
