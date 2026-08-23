-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "restaurantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
