-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'HOLD';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "holdName" TEXT;

-- CreateTable
CREATE TABLE "order_cancellations" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonType" TEXT NOT NULL,
    "refundAmount" DECIMAL(10,2),
    "refundMethod" TEXT,
    "refundStatus" TEXT DEFAULT 'PENDING',
    "cancelledBy" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "order_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_returns" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "returnType" TEXT NOT NULL,
    "returnReason" TEXT NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL,
    "refundMethod" TEXT NOT NULL,
    "refundStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "returnedBy" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "order_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_return_items" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_splits" (
    "id" TEXT NOT NULL,
    "originalOrderId" TEXT NOT NULL,
    "splitOrderId" TEXT NOT NULL,
    "splitBy" TEXT NOT NULL,
    "splitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_merges" (
    "id" TEXT NOT NULL,
    "mergedOrderId" TEXT NOT NULL,
    "originalOrderId" TEXT NOT NULL,
    "mergedBy" TEXT NOT NULL,
    "mergedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_merges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_cancellations_orderId_key" ON "order_cancellations"("orderId");

-- CreateIndex
CREATE INDEX "order_cancellations_orderId_idx" ON "order_cancellations"("orderId");

-- CreateIndex
CREATE INDEX "order_cancellations_cancelledBy_idx" ON "order_cancellations"("cancelledBy");

-- CreateIndex
CREATE INDEX "order_cancellations_cancelledAt_idx" ON "order_cancellations"("cancelledAt");

-- CreateIndex
CREATE INDEX "order_cancellations_reasonType_idx" ON "order_cancellations"("reasonType");

-- CreateIndex
CREATE INDEX "order_returns_orderId_idx" ON "order_returns"("orderId");

-- CreateIndex
CREATE INDEX "order_returns_returnedBy_idx" ON "order_returns"("returnedBy");

-- CreateIndex
CREATE INDEX "order_returns_returnedAt_idx" ON "order_returns"("returnedAt");

-- CreateIndex
CREATE INDEX "order_returns_returnType_idx" ON "order_returns"("returnType");

-- CreateIndex
CREATE INDEX "order_return_items_returnId_idx" ON "order_return_items"("returnId");

-- CreateIndex
CREATE INDEX "order_return_items_orderItemId_idx" ON "order_return_items"("orderItemId");

-- CreateIndex
CREATE INDEX "order_splits_originalOrderId_idx" ON "order_splits"("originalOrderId");

-- CreateIndex
CREATE INDEX "order_splits_splitOrderId_idx" ON "order_splits"("splitOrderId");

-- CreateIndex
CREATE INDEX "order_splits_splitBy_idx" ON "order_splits"("splitBy");

-- CreateIndex
CREATE UNIQUE INDEX "order_splits_originalOrderId_splitOrderId_key" ON "order_splits"("originalOrderId", "splitOrderId");

-- CreateIndex
CREATE INDEX "order_merges_mergedOrderId_idx" ON "order_merges"("mergedOrderId");

-- CreateIndex
CREATE INDEX "order_merges_originalOrderId_idx" ON "order_merges"("originalOrderId");

-- CreateIndex
CREATE INDEX "order_merges_mergedBy_idx" ON "order_merges"("mergedBy");

-- CreateIndex
CREATE INDEX "orders_status_orderCreator_idx" ON "orders"("status", "orderCreator");

-- AddForeignKey
ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_returnedBy_fkey" FOREIGN KEY ("returnedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_return_items" ADD CONSTRAINT "order_return_items_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "order_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_return_items" ADD CONSTRAINT "order_return_items_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_splits" ADD CONSTRAINT "order_splits_originalOrderId_fkey" FOREIGN KEY ("originalOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_splits" ADD CONSTRAINT "order_splits_splitOrderId_fkey" FOREIGN KEY ("splitOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_splits" ADD CONSTRAINT "order_splits_splitBy_fkey" FOREIGN KEY ("splitBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_merges" ADD CONSTRAINT "order_merges_mergedOrderId_fkey" FOREIGN KEY ("mergedOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_merges" ADD CONSTRAINT "order_merges_originalOrderId_fkey" FOREIGN KEY ("originalOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_merges" ADD CONSTRAINT "order_merges_mergedBy_fkey" FOREIGN KEY ("mergedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
