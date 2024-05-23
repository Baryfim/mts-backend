/*
  Warnings:

  - You are about to drop the `GroupOnPostCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupOnPostCategory" DROP CONSTRAINT "GroupOnPostCategory_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupOnPostCategory" DROP CONSTRAINT "GroupOnPostCategory_postCategoryId_fkey";

-- DropTable
DROP TABLE "GroupOnPostCategory";

-- CreateTable
CREATE TABLE "_GroupToPostCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToPostCategory_AB_unique" ON "_GroupToPostCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToPostCategory_B_index" ON "_GroupToPostCategory"("B");

-- AddForeignKey
ALTER TABLE "_GroupToPostCategory" ADD CONSTRAINT "_GroupToPostCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToPostCategory" ADD CONSTRAINT "_GroupToPostCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
