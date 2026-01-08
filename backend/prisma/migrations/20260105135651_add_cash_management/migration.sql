-- CreateTable
CREATE TABLE "cash_openings" (
    "id" TEXT NOT NULL,
    "shiftCheckInId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openingAmount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_closings" (
    "id" TEXT NOT NULL,
    "shiftCheckInId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expectedAmount" DECIMAL(10,2) NOT NULL,
    "actualAmount" DECIMAL(10,2) NOT NULL,
    "difference" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_closings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cash_openings_shiftCheckInId_key" ON "cash_openings"("shiftCheckInId");

-- CreateIndex
CREATE INDEX "cash_openings_userId_idx" ON "cash_openings"("userId");

-- CreateIndex
CREATE INDEX "cash_openings_createdAt_idx" ON "cash_openings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cash_closings_shiftCheckInId_key" ON "cash_closings"("shiftCheckInId");

-- CreateIndex
CREATE INDEX "cash_closings_userId_idx" ON "cash_closings"("userId");

-- CreateIndex
CREATE INDEX "cash_closings_createdAt_idx" ON "cash_closings"("createdAt");

-- AddForeignKey
ALTER TABLE "cash_openings" ADD CONSTRAINT "cash_openings_shiftCheckInId_fkey" FOREIGN KEY ("shiftCheckInId") REFERENCES "shift_check_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_openings" ADD CONSTRAINT "cash_openings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_closings" ADD CONSTRAINT "cash_closings_shiftCheckInId_fkey" FOREIGN KEY ("shiftCheckInId") REFERENCES "shift_check_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_closings" ADD CONSTRAINT "cash_closings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
