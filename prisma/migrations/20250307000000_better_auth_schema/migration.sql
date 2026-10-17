-- Better Auth schema migration: backfill existing User, Account, Session data.
-- Idempotent: safe for shadow DB (fresh replay) and when migration was already applied (e.g. same DB as shadow).

-- ========== User ==========
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Only convert emailVerified if still timestamp (skip if already boolean, e.g. re-run)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'emailVerified'
    AND data_type IN ('timestamp with time zone', 'timestamp without time zone')
  ) THEN
    ALTER TABLE "User" ALTER COLUMN "emailVerified" DROP DEFAULT;
    ALTER TABLE "User" ALTER COLUMN "emailVerified" TYPE BOOLEAN USING (CASE WHEN "emailVerified" IS NOT NULL THEN true ELSE false END);
    ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;
  END IF;
END $$;

-- ========== Account ==========
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "idToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Backfill Account only when old columns exist (so we don't reference dropped columns on re-run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Account' AND column_name = 'providerAccountId') THEN
    UPDATE "Account" SET
      "accountId" = "providerAccountId",
      "providerId" = "provider",
      "accessToken" = "access_token",
      "refreshToken" = "refresh_token",
      "idToken" = "id_token",
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "accountId" IS NULL;
    UPDATE "Account" SET "accessTokenExpiresAt" = to_timestamp("expires_at")::timestamp(3)
    WHERE "expires_at" IS NOT NULL AND "accessTokenExpiresAt" IS NULL;
  END IF;
END $$;

ALTER TABLE "Account" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "providerId" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "provider";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "providerAccountId";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "refresh_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "access_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "expires_at";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "token_type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "id_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "session_state";

DROP INDEX IF EXISTS "Account_providerId_accountId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- ========== Session ==========
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "token" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Session' AND column_name = 'sessionToken') THEN
    UPDATE "Session" SET
      "token" = "sessionToken",
      "expiresAt" = "expires",
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "token" IS NULL;
  END IF;
END $$;

ALTER TABLE "Session" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "Session_sessionToken_key";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "sessionToken";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "expires";

DROP INDEX IF EXISTS "Session_token_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");

-- ========== Verification ==========
CREATE TABLE IF NOT EXISTS "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "VerificationToken";
