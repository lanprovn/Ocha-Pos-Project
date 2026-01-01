-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(10,2);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "membershipDiscount" DECIMAL(10,2);

