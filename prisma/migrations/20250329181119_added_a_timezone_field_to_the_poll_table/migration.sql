/*
  Warnings:

  - Added the required column `timezone` to the `Poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "timezone" TEXT NOT NULL;
