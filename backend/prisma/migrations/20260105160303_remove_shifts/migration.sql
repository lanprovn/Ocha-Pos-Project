/*
  Warnings:

  - You are about to drop the column `activeShiftId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shiftId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `active_shifts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_closings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_openings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_check_ins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shifts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "active_shifts" DROP CONSTRAINT "active_shifts_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "active_shifts" DROP CONSTRAINT "active_shifts_userId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_userId_fkey";

-- DropForeignKey
ALTER TABLE "cash_closings" DROP CONSTRAINT "cash_closings_shiftCheckInId_fkey";

-- DropForeignKey
ALTER TABLE "cash_closings" DROP CONSTRAINT "cash_closings_userId_fkey";

-- DropForeignKey
ALTER TABLE "cash_openings" DROP CONSTRAINT "cash_openings_shiftCheckInId_fkey";

-- DropForeignKey
ALTER TABLE "cash_openings" DROP CONSTRAINT "cash_openings_userId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_activeShiftId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_userId_fkey";

-- DropForeignKey
ALTER TABLE "shift_check_ins" DROP CONSTRAINT "shift_check_ins_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "shift_check_ins" DROP CONSTRAINT "shift_check_ins_userId_fkey";

-- DropIndex
DROP INDEX "orders_activeShiftId_idx";

-- DropIndex
DROP INDEX "orders_shiftId_idx";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "activeShiftId",
DROP COLUMN "shiftId";

-- DropTable
DROP TABLE "active_shifts";

-- DropTable
DROP TABLE "attendances";

-- DropTable
DROP TABLE "cash_closings";

-- DropTable
DROP TABLE "cash_openings";

-- DropTable
DROP TABLE "shift_assignments";

-- DropTable
DROP TABLE "shift_check_ins";

-- DropTable
DROP TABLE "shifts";

-- DropEnum
DROP TYPE "ShiftStatus";
