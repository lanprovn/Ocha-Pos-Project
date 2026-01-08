-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "activeShiftId" TEXT;

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOut" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_shifts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "initialCash" DECIMAL(10,2) NOT NULL,
    "expectedCash" DECIMAL(10,2),
    "actualCash" DECIMAL(10,2),
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendances_userId_idx" ON "attendances"("userId");

-- CreateIndex
CREATE INDEX "attendances_checkIn_idx" ON "attendances"("checkIn");

-- CreateIndex
CREATE INDEX "attendances_userId_checkIn_idx" ON "attendances"("userId", "checkIn");

-- CreateIndex
CREATE UNIQUE INDEX "active_shifts_attendanceId_key" ON "active_shifts"("attendanceId");

-- CreateIndex
CREATE INDEX "active_shifts_userId_idx" ON "active_shifts"("userId");

-- CreateIndex
CREATE INDEX "active_shifts_status_idx" ON "active_shifts"("status");

-- CreateIndex
CREATE INDEX "active_shifts_openedAt_idx" ON "active_shifts"("openedAt");

-- CreateIndex
CREATE INDEX "active_shifts_userId_status_idx" ON "active_shifts"("userId", "status");

-- CreateIndex
CREATE INDEX "orders_activeShiftId_idx" ON "orders"("activeShiftId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_activeShiftId_fkey" FOREIGN KEY ("activeShiftId") REFERENCES "active_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_shifts" ADD CONSTRAINT "active_shifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_shifts" ADD CONSTRAINT "active_shifts_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
