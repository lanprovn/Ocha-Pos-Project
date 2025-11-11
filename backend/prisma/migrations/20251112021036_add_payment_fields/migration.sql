-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentTransactionId" TEXT;
