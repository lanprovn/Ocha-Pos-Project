/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `promotionCode` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `promotionId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shiftId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `price_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promotion_usages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promotions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shift_check_ins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shifts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "price_history" DROP CONSTRAINT "price_history_productId_fkey";

-- DropForeignKey
ALTER TABLE "promotion_usages" DROP CONSTRAINT "promotion_usages_orderId_fkey";

-- DropForeignKey
ALTER TABLE "promotion_usages" DROP CONSTRAINT "promotion_usages_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_userId_fkey";

-- DropForeignKey
ALTER TABLE "shift_check_ins" DROP CONSTRAINT "shift_check_ins_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "shift_check_ins" DROP CONSTRAINT "shift_check_ins_userId_fkey";

-- DropIndex
DROP INDEX "orders_promotionId_idx";

-- DropIndex
DROP INDEX "orders_shiftId_idx";

-- AlterTable
ALTER TABLE "customers" RENAME CONSTRAINT "Customer_pkey" TO "customers_pkey";

-- AlterTable
ALTER TABLE "loyalty_transactions" RENAME CONSTRAINT "LoyaltyTransaction_pkey" TO "loyalty_transactions_pkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "discountAmount",
DROP COLUMN "promotionCode",
DROP COLUMN "promotionId",
DROP COLUMN "shiftId",
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT;

-- DropTable
DROP TABLE "activity_logs";

-- DropTable
DROP TABLE "price_history";

-- DropTable
DROP TABLE "promotion_usages";

-- DropTable
DROP TABLE "promotions";

-- DropTable
DROP TABLE "shift_assignments";

-- DropTable
DROP TABLE "shift_check_ins";

-- DropTable
DROP TABLE "shifts";

-- DropEnum
DROP TYPE "ActivityAction";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "PromotionType";
