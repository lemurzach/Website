-- CreateEnum
CREATE TYPE "HeroStatus" AS ENUM ('ACTIVE', 'RETIRED', 'MISSING');

-- CreateEnum
CREATE TYPE "VillainStatus" AS ENUM ('AT_LARGE', 'CAPTURED');

-- CreateEnum
CREATE TYPE "DangerLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'EXTREME');

-- CreateTable
CREATE TABLE "Hero" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "heroName" TEXT NOT NULL,
    "quirk" TEXT NOT NULL,
    "quirkDescription" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "imageUrl" TEXT,
    "agency" TEXT,
    "status" "HeroStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Villain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "quirk" TEXT NOT NULL,
    "quirkDescription" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "imageUrl" TEXT,
    "bounty" INTEGER NOT NULL,
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'MODERATE',
    "status" "VillainStatus" NOT NULL DEFAULT 'AT_LARGE',
    "lastKnownLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Villain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hero_rank_idx" ON "Hero"("rank");

-- CreateIndex
CREATE INDEX "Villain_bounty_idx" ON "Villain"("bounty");
