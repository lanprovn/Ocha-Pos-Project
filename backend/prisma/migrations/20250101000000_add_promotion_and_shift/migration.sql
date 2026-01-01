-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "promotion_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minOrderAmount" DECIMAL(10,2),
    "maxDiscountAmount" DECIMAL(10,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerCustomer" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_code_usages" (
    "id" TEXT NOT NULL,
    "promotionCodeId" TEXT NOT NULL,
    "orderId" TEXT,
    "customerId" TEXT,
    "customerPhone" TEXT,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_code_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "shiftNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "openingCash" DECIMAL(10,2) NOT NULL,
    "closingCash" DECIMAL(10,2),
    "expectedCash" DECIMAL(10,2),
    "variance" DECIMAL(10,2),
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- AlterTable (commented out - orders table may not exist yet)
-- These will be added in a later migration when orders table exists
-- ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promotionCodeId" TEXT;
-- ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promotionDiscount" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "promotion_codes_code_key" ON "promotion_codes"("code");

-- CreateIndex
CREATE INDEX "promotion_codes_code_idx" ON "promotion_codes"("code");

-- CreateIndex
CREATE INDEX "promotion_codes_isActive_idx" ON "promotion_codes"("isActive");

-- CreateIndex
CREATE INDEX "promotion_codes_startDate_endDate_idx" ON "promotion_codes"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_shiftNumber_key" ON "shifts"("shiftNumber");

-- CreateIndex
CREATE INDEX "shifts_shiftNumber_idx" ON "shifts"("shiftNumber");

-- CreateIndex
CREATE INDEX "shifts_userId_idx" ON "shifts"("userId");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "shifts"("status");

-- CreateIndex
CREATE INDEX "shifts_startTime_idx" ON "shifts"("startTime");

-- CreateIndex
CREATE INDEX "shifts_startTime_endTime_idx" ON "shifts"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "promotion_code_usages_promotionCodeId_idx" ON "promotion_code_usages"("promotionCodeId");

-- CreateIndex
CREATE INDEX "promotion_code_usages_orderId_idx" ON "promotion_code_usages"("orderId");

-- CreateIndex
CREATE INDEX "promotion_code_usages_customerId_idx" ON "promotion_code_usages"("customerId");

-- CreateIndex
CREATE INDEX "promotion_code_usages_customerPhone_idx" ON "promotion_code_usages"("customerPhone");

-- CreateIndex
CREATE INDEX "promotion_code_usages_createdAt_idx" ON "promotion_code_usages"("createdAt");

-- CreateIndex (commented out - orders table may not exist yet)
-- CREATE INDEX "orders_promotionCodeId_idx" ON "orders"("promotionCodeId");

-- AddForeignKey
ALTER TABLE "promotion_code_usages" ADD CONSTRAINT "promotion_code_usages_promotionCodeId_fkey" FOREIGN KEY ("promotionCodeId") REFERENCES "promotion_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (commented out - orders table may not exist yet)
-- ALTER TABLE "orders" ADD CONSTRAINT "orders_promotionCodeId_fkey" FOREIGN KEY ("promotionCodeId") REFERENCES "promotion_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

