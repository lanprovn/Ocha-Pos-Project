-- AlterTable
ALTER TABLE "Customer" RENAME CONSTRAINT "customers_pkey" TO "Customer_pkey";

-- AlterTable
ALTER TABLE "LoyaltyTransaction" RENAME CONSTRAINT "loyalty_transactions_pkey" TO "LoyaltyTransaction_pkey";
