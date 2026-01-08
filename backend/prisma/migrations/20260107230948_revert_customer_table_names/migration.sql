-- Revert table names to lowercase to match Prisma schema
-- This ensures consistency between database table names and Prisma model names

-- Drop foreign keys first
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_customerId_fkey";
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT IF EXISTS "LoyaltyTransaction_customerId_fkey";
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT IF EXISTS "LoyaltyTransaction_orderId_fkey";

-- Rename tables back to lowercase
ALTER TABLE "Customer" RENAME TO "customers";
ALTER TABLE "LoyaltyTransaction" RENAME TO "loyalty_transactions";

-- Recreate indexes with correct names
DROP INDEX IF EXISTS "Customer_phone_key";
DROP INDEX IF EXISTS "Customer_email_key";
DROP INDEX IF EXISTS "Customer_email_idx";
DROP INDEX IF EXISTS "Customer_isActive_idx";
DROP INDEX IF EXISTS "Customer_membershipLevel_idx";
DROP INDEX IF EXISTS "Customer_phone_idx";

CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "customers_isActive_idx" ON "customers"("isActive");
CREATE INDEX "customers_membershipLevel_idx" ON "customers"("membershipLevel");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- Recreate indexes for loyalty_transactions
DROP INDEX IF EXISTS "LoyaltyTransaction_createdAt_idx";
DROP INDEX IF EXISTS "LoyaltyTransaction_customerId_idx";
DROP INDEX IF EXISTS "LoyaltyTransaction_orderId_idx";
DROP INDEX IF EXISTS "LoyaltyTransaction_type_idx";

CREATE INDEX "loyalty_transactions_createdAt_idx" ON "loyalty_transactions"("createdAt");
CREATE INDEX "loyalty_transactions_customerId_idx" ON "loyalty_transactions"("customerId");
CREATE INDEX "loyalty_transactions_orderId_idx" ON "loyalty_transactions"("orderId");
CREATE INDEX "loyalty_transactions_type_idx" ON "loyalty_transactions"("type");

-- Recreate foreign keys
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
