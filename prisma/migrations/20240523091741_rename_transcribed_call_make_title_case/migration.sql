/*
  Warnings:

  - You are about to drop the `transcribedCall` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "transcribedCall";

-- CreateTable
CREATE TABLE "TranscribedCall" (
    "id" SERIAL NOT NULL,
    "crmId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "qualityPercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TranscribedCall_pkey" PRIMARY KEY ("id")
);
