-- AlterTable
ALTER TABLE "ingredient_stocks" ADD COLUMN     "reservedQuantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stock" ADD COLUMN     "reservedQuantity" INTEGER NOT NULL DEFAULT 0;
