-- Initial database schema for Connect App
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/sql/new

-- Create enum types
CREATE TYPE "LocationPrivacy" AS ENUM ('EXACT', 'APPROXIMATE', 'CITY_ONLY', 'HIDDEN');
CREATE TYPE "GroupType" AS ENUM ('HOBBY', 'SUPPORT', 'SPIRITUAL', 'PROFESSIONAL', 'SOCIAL', 'OTHER');
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'LEADER', 'CREATOR');
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REMOVED');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');

-- Create Person table
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "supabaseUserId" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationPrivacy" "LocationPrivacy" NOT NULL DEFAULT 'APPROXIMATE',
    "proximityRadiusKm" INTEGER NOT NULL DEFAULT 50,
    "ageRange" TEXT,
    "gender" TEXT,
    "personalityTraits" JSONB,
    "groupPreferences" JSONB,
    "onboardingLevel" INTEGER NOT NULL DEFAULT 0,
    "safetyFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedPersons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Group table
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "type" "GroupType" NOT NULL,
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
    CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create GroupMembership table
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "personId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "joinRequestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "lastEngagedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("personId", "groupId")
);

-- Create Interest table
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create PersonInterest table
CREATE TABLE "PersonInterest" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "personId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonInterest_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("personId", "interestId")
);

-- Create CompatibilityScore table
CREATE TABLE "CompatibilityScore" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "personId" TEXT NOT NULL,
    "matchedPersonId" TEXT NOT NULL,
    "interestSimilarity" DOUBLE PRECISION NOT NULL,
    "proximityScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "matchReasons" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompatibilityScore_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompatibilityScore_matchedPersonId_fkey" FOREIGN KEY ("matchedPersonId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("personId", "matchedPersonId")
);

-- Create SafetyReport table
CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "reporterId" TEXT,
    "reportedPersonId" TEXT,
    "reportedGroupId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "actionTaken" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Person
CREATE INDEX "Person_latitude_longitude_idx" ON "Person"("latitude", "longitude");
CREATE INDEX "Person_onboardingLevel_idx" ON "Person"("onboardingLevel");

-- Create indexes for Group
CREATE INDEX "Group_latitude_longitude_idx" ON "Group"("latitude", "longitude");
CREATE INDEX "Group_status_idx" ON "Group"("status");
CREATE INDEX "Group_type_idx" ON "Group"("type");

-- Create indexes for GroupMembership
CREATE INDEX "GroupMembership_personId_idx" ON "GroupMembership"("personId");
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");
CREATE INDEX "GroupMembership_status_idx" ON "GroupMembership"("status");

-- Create indexes for Interest
CREATE INDEX "Interest_category_idx" ON "Interest"("category");
CREATE INDEX "Interest_popularity_idx" ON "Interest"("popularity");

-- Create indexes for PersonInterest
CREATE INDEX "PersonInterest_personId_idx" ON "PersonInterest"("personId");
CREATE INDEX "PersonInterest_interestId_idx" ON "PersonInterest"("interestId");

-- Create indexes for CompatibilityScore
CREATE INDEX "CompatibilityScore_personId_overallScore_idx" ON "CompatibilityScore"("personId", "overallScore");
CREATE INDEX "CompatibilityScore_expiresAt_idx" ON "CompatibilityScore"("expiresAt");

-- Create indexes for SafetyReport
CREATE INDEX "SafetyReport_status_idx" ON "SafetyReport"("status");
CREATE INDEX "SafetyReport_reportedPersonId_idx" ON "SafetyReport"("reportedPersonId");

-- Success message
SELECT 'Database schema created successfully!' as message;
