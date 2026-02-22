-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "onboardingLevel" INTEGER NOT NULL DEFAULT 0,
    "leadershipSignals" JSONB,
    "gamificationMeta" JSONB,
    "blockedPersons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safetyFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "subcategory" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonInterest" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "proficiencyLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT,
    "reportedPersonId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_supabaseUserId_key" ON "Person"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE INDEX "Person_latitude_longitude_idx" ON "Person"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Person_onboardingLevel_idx" ON "Person"("onboardingLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- CreateIndex
CREATE INDEX "Interest_category_idx" ON "Interest"("category");

-- CreateIndex
CREATE INDEX "Interest_popularity_idx" ON "Interest"("popularity");

-- CreateIndex
CREATE INDEX "PersonInterest_personId_idx" ON "PersonInterest"("personId");

-- CreateIndex
CREATE INDEX "PersonInterest_interestId_idx" ON "PersonInterest"("interestId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonInterest_personId_interestId_key" ON "PersonInterest"("personId", "interestId");

-- CreateIndex
CREATE INDEX "SafetyReport_status_idx" ON "SafetyReport"("status");

-- CreateIndex
CREATE INDEX "SafetyReport_reportedPersonId_idx" ON "SafetyReport"("reportedPersonId");

-- AddForeignKey
ALTER TABLE "PersonInterest" ADD CONSTRAINT "PersonInterest_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonInterest" ADD CONSTRAINT "PersonInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
