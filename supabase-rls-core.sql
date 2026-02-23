-- Core RLS Policies for Brotherhood Connect
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/sql

-- Enable RLS on all core tables
ALTER TABLE "Person" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PersonInterest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HuddleMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SafetyReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompatibilityScore" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Person Policies
-- ============================================================================

-- Anyone authenticated can view other persons (for discovery)
DROP POLICY IF EXISTS "Anyone can view persons" ON "Person";
CREATE POLICY "Anyone can view persons"
  ON "Person" FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update their own person record
DROP POLICY IF EXISTS "Users can update own person" ON "Person";
CREATE POLICY "Users can update own person"
  ON "Person" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Person" p
      WHERE p."supabaseUserId" = auth.uid()::text
      AND p."id" = "Person"."id"
    )
  );

-- Allow person creation during signup
DROP POLICY IF EXISTS "Allow person creation" ON "Person";
CREATE POLICY "Allow person creation"
  ON "Person" FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- Interest Policies
-- ============================================================================

-- Anyone can view interests (read-only reference data)
DROP POLICY IF EXISTS "Anyone can view interests" ON "Interest";
CREATE POLICY "Anyone can view interests"
  ON "Interest" FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PersonInterest Policies
-- ============================================================================

-- Users can view all person interests (for matching)
DROP POLICY IF EXISTS "Anyone can view person interests" ON "PersonInterest";
CREATE POLICY "Anyone can view person interests"
  ON "PersonInterest" FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can manage their own interests
DROP POLICY IF EXISTS "Users can insert own interests" ON "PersonInterest";
CREATE POLICY "Users can insert own interests"
  ON "PersonInterest" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "PersonInterest"."personId"
    )
  );

DROP POLICY IF EXISTS "Users can delete own interests" ON "PersonInterest";
CREATE POLICY "Users can delete own interests"
  ON "PersonInterest" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "PersonInterest"."personId"
    )
  );

-- ============================================================================
-- Group Policies
-- ============================================================================

-- Anyone can view active public groups
DROP POLICY IF EXISTS "Anyone can view public groups" ON "Group";
CREATE POLICY "Anyone can view public groups"
  ON "Group" FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    ("isPublic" = true OR EXISTS (
      SELECT 1 FROM "GroupMembership" gm
      JOIN "Person" p ON gm."personId" = p.id
      WHERE gm."groupId" = "Group"."id"
      AND p."supabaseUserId" = auth.uid()::text
      AND gm."status" = 'ACTIVE'
    ))
  );

-- Authenticated users can create groups
DROP POLICY IF EXISTS "Users can create groups" ON "Group";
CREATE POLICY "Users can create groups"
  ON "Group" FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "Group"."createdBy"
    )
  );

-- Group creators and leaders can update groups
DROP POLICY IF EXISTS "Leaders can update groups" ON "Group";
CREATE POLICY "Leaders can update groups"
  ON "Group" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND (
        "id" = "Group"."createdBy" OR
        "id" = ANY("Group"."leaderIds")
      )
    )
  );

-- ============================================================================
-- GroupMembership Policies
-- ============================================================================

-- Anyone can view group memberships (for member lists)
DROP POLICY IF EXISTS "Anyone can view memberships" ON "GroupMembership";
CREATE POLICY "Anyone can view memberships"
  ON "GroupMembership" FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can create their own membership requests
DROP POLICY IF EXISTS "Users can request to join" ON "GroupMembership";
CREATE POLICY "Users can request to join"
  ON "GroupMembership" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "GroupMembership"."personId"
    )
  );

-- Users can update their own memberships (leave group)
-- Leaders can update memberships in their groups
DROP POLICY IF EXISTS "Users and leaders can update memberships" ON "GroupMembership";
CREATE POLICY "Users and leaders can update memberships"
  ON "GroupMembership" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Person" p
      WHERE p."supabaseUserId" = auth.uid()::text
      AND (
        p."id" = "GroupMembership"."personId" OR
        EXISTS (
          SELECT 1 FROM "Group" g
          WHERE g."id" = "GroupMembership"."groupId"
          AND (g."createdBy" = p."id" OR p."id" = ANY(g."leaderIds"))
        )
      )
    )
  );

-- ============================================================================
-- HuddleMessage Policies
-- ============================================================================

-- Users can view messages in huddles they're members of
DROP POLICY IF EXISTS "Members can view huddle messages" ON "HuddleMessage";
CREATE POLICY "Members can view huddle messages"
  ON "HuddleMessage" FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    "deletedAt" IS NULL AND
    EXISTS (
      SELECT 1 FROM "GroupMembership" gm
      JOIN "Person" p ON gm."personId" = p.id
      WHERE gm."groupId" = "HuddleMessage"."huddleId"
      AND p."supabaseUserId" = auth.uid()::text
      AND gm."status" = 'ACTIVE'
    )
  );

-- Members can send messages to huddles
DROP POLICY IF EXISTS "Members can send messages" ON "HuddleMessage";
CREATE POLICY "Members can send messages"
  ON "HuddleMessage" FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM "GroupMembership" gm
      JOIN "Person" p ON gm."personId" = p.id
      WHERE gm."groupId" = "HuddleMessage"."huddleId"
      AND p."supabaseUserId" = auth.uid()::text
      AND p."id" = "HuddleMessage"."senderId"
      AND gm."status" = 'ACTIVE'
    )
  );

-- Senders can update their own messages (soft delete)
DROP POLICY IF EXISTS "Senders can update own messages" ON "HuddleMessage";
CREATE POLICY "Senders can update own messages"
  ON "HuddleMessage" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "HuddleMessage"."senderId"
    )
  );

-- ============================================================================
-- SafetyReport Policies
-- ============================================================================

-- Users can create safety reports
DROP POLICY IF EXISTS "Users can create reports" ON "SafetyReport";
CREATE POLICY "Users can create reports"
  ON "SafetyReport" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "SafetyReport"."reporterId"
    )
  );

-- Users can view reports they created
DROP POLICY IF EXISTS "Users can view own reports" ON "SafetyReport";
CREATE POLICY "Users can view own reports"
  ON "SafetyReport" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "SafetyReport"."reporterId"
    )
  );

-- ============================================================================
-- CompatibilityScore Policies
-- ============================================================================

-- Users can view their own compatibility scores
DROP POLICY IF EXISTS "Users can view own scores" ON "CompatibilityScore";
CREATE POLICY "Users can view own scores"
  ON "CompatibilityScore" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()::text
      AND "id" = "CompatibilityScore"."personId"
    )
  );

-- System can insert scores (via service role)
DROP POLICY IF EXISTS "Service can insert scores" ON "CompatibilityScore";
CREATE POLICY "Service can insert scores"
  ON "CompatibilityScore" FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service can update scores" ON "CompatibilityScore";
CREATE POLICY "Service can update scores"
  ON "CompatibilityScore" FOR UPDATE
  USING (true);
