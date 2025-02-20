/*
  Warnings:

  - The values [TAKEWAY] on the enum `ConsumptionMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `productID` on the `OrderProduct` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `productId` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConsumptionMethod_new" AS ENUM ('TAKEAWAY', 'DINE_IN');
ALTER TABLE "Order" ALTER COLUMN "consumptionMethod" TYPE "ConsumptionMethod_new" USING ("consumptionMethod"::text::"ConsumptionMethod_new");
ALTER TYPE "ConsumptionMethod" RENAME TO "ConsumptionMethod_old";
ALTER TYPE "ConsumptionMethod_new" RENAME TO "ConsumptionMethod";
DROP TYPE "ConsumptionMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_productID_fkey";

-- AlterTable
ALTER TABLE "OrderProduct" DROP COLUMN "productID",
ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "location";

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
