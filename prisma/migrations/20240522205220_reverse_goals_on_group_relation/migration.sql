/*
  Warnings:

  - You are about to drop the column `goalId` on the `Group` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_goalId_fkey";

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "goalId";

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
