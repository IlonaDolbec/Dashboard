/*
  Warnings:

  - You are about to drop the column `requiresAuth` on the `Service` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('NONE', 'CREDENTIALS', 'OAUTH');

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "requiresAuth",
ADD COLUMN     "authType" "AuthType" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "username" TEXT;
