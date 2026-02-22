/*
  Warnings:

  - The `status` column on the `SafetyReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('HOBBY', 'SUPPORT', 'SPIRITUAL', 'PROFESSIONAL', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'LEADER', 'CREATOR');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "LocationPrivacy" AS ENUM ('EXACT', 'APPROXIMATE', 'CITY_ONLY', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');

-- DropIndex
DROP INDEX "SafetyReport_reportedPersonId_idx";

-- DropIndex
DROP INDEX "SafetyReport_status_idx";

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "groupPreferences" JSONB,
ADD COLUMN     "isPotentialShepherd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" geography,
ADD COLUMN     "locationPrivacy" "LocationPrivacy" NOT NULL DEFAULT 'APPROXIMATE',
ADD COLUMN     "personalityTraits" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "proximityRadiusKm" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "PersonInterest" ALTER COLUMN "proficiencyLevel" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "SafetyReport" ADD COLUMN     "actionTaken" JSONB,
ADD COLUMN     "reportedGroupId" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "CompatibilityScore" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "matchedPersonId" TEXT NOT NULL,
    "interestSimilarity" DOUBLE PRECISION NOT NULL,
    "proximityScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "matchReasons" TEXT[],
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompatibilityScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "protocol" TEXT,
    "imageUrl" TEXT,
    "type" "GroupType" NOT NULL,
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "minSize" INTEGER NOT NULL DEFAULT 2,
    "maxSize" INTEGER,
    "currentSize" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "leaderIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" geography,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "personId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "joinRequestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "lastEngagedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompatibilityScore_personId_overallScore_idx" ON "CompatibilityScore"("personId", "overallScore");

-- CreateIndex
CREATE INDEX "CompatibilityScore_calculatedAt_idx" ON "CompatibilityScore"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompatibilityScore_personId_matchedPersonId_key" ON "CompatibilityScore"("personId", "matchedPersonId");

-- CreateIndex
CREATE INDEX "Group_createdBy_idx" ON "Group"("createdBy");

-- CreateIndex
CREATE INDEX "Group_latitude_longitude_idx" ON "Group"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Group_status_idx" ON "Group"("status");

-- CreateIndex
CREATE INDEX "Group_type_idx" ON "Group"("type");

-- CreateIndex
CREATE INDEX "idx_group_location" ON "Group" USING GIST ("location");

-- CreateIndex
CREATE INDEX "GroupMembership_personId_idx" ON "GroupMembership"("personId");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_status_idx" ON "GroupMembership"("status");

-- CreateIndex
CREATE INDEX "GroupMembership_role_idx" ON "GroupMembership"("role");

-- CreateIndex
CREATE INDEX "idx_person_location" ON "Person" USING GIST ("location");

-- CreateIndex
CREATE INDEX "PersonInterest_proficiencyLevel_idx" ON "PersonInterest"("proficiencyLevel");

-- CreateIndex
CREATE INDEX "SafetyReport_reporterId_idx" ON "SafetyReport"("reporterId");

-- CreateIndex
CREATE INDEX "SafetyReport_reportedPersonId_status_idx" ON "SafetyReport"("reportedPersonId", "status");

-- CreateIndex
CREATE INDEX "SafetyReport_reportedGroupId_status_idx" ON "SafetyReport"("reportedGroupId", "status");

-- CreateIndex
CREATE INDEX "SafetyReport_status_createdAt_idx" ON "SafetyReport"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reportedPersonId_fkey" FOREIGN KEY ("reportedPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reportedGroupId_fkey" FOREIGN KEY ("reportedGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilityScore" ADD CONSTRAINT "CompatibilityScore_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
