-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "oauthAuthorizeUrl" TEXT,
ADD COLUMN     "oauthClientId" TEXT,
ADD COLUMN     "oauthClientSecret" TEXT,
ADD COLUMN     "oauthScope" TEXT,
ADD COLUMN     "oauthTokenUrl" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT;
