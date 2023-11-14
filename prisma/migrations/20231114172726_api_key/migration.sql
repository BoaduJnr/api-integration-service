/*
  Warnings:

  - You are about to drop the column `API_key` on the `APIKey` table. All the data in the column will be lost.
  - You are about to drop the column `deactivatedAt` on the `APIKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiKey]` on the table `APIKey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE apikey_id_seq;
ALTER TABLE "APIKey" DROP COLUMN "API_key",
DROP COLUMN "deactivatedAt",
ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "deactivateAt" TIMESTAMP(3),
ALTER COLUMN "id" SET DEFAULT nextval('apikey_id_seq');
ALTER SEQUENCE apikey_id_seq OWNED BY "APIKey"."id";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "deactivateAt" TIMESTAMP(3),
ADD COLUMN     "deactivated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_apiKey_key" ON "APIKey"("apiKey");
