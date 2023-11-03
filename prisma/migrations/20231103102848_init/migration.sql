/*
  Warnings:

  - You are about to drop the column `api_key` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `OauthToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Revoke` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `organizationId` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "OauthToken" DROP CONSTRAINT "OauthToken_api_key_fkey";

-- DropForeignKey
ALTER TABLE "Revoke" DROP CONSTRAINT "Revoke_accountId_fkey";

-- DropIndex
DROP INDEX "Account_api_key_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "api_key",
DROP COLUMN "organizationId",
ADD COLUMN     "organizationId" UUID NOT NULL;

-- DropTable
DROP TABLE "OauthToken";

-- DropTable
DROP TABLE "Revoke";

-- CreateTable
CREATE TABLE "APIKey" (
    "id" INTEGER NOT NULL,
    "API_key" TEXT NOT NULL,
    "deactivated" BOOLEAN NOT NULL DEFAULT false,
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" UUID NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_organizationId_key" ON "Account"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- AddForeignKey
ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Account"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
