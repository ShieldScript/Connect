-- RLS Policies for Prayer Wall Feature
-- Execute this SQL in Supabase SQL Editor

-- Enable RLS on new tables
ALTER TABLE "PrayerPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrayerResponse" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- PrayerPost policies
CREATE POLICY "Anyone can view active prayers"
  ON "PrayerPost" FOR SELECT
  USING (auth.uid() IS NOT NULL AND "deletedAt" IS NULL);

CREATE POLICY "Onboarded users can create prayers"
  ON "PrayerPost" FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()
      AND "onboardingLevel" >= 1
    )
  );

CREATE POLICY "Authors can update their prayers"
  ON "PrayerPost" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()
      AND "id" = "PrayerPost"."authorId"
    )
  );

-- PrayerResponse policies
CREATE POLICY "Anyone can view prayer responses"
  ON "PrayerResponse" FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create prayer responses"
  ON "PrayerResponse" FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()
      AND "id" = "PrayerResponse"."prayerId"
    )
  );

-- Notification policies
CREATE POLICY "Users can view their own notifications"
  ON "Notification" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()
      AND "id" = "Notification"."personId"
    )
  );

CREATE POLICY "Users can update their own notifications"
  ON "Notification" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Person"
      WHERE "supabaseUserId" = auth.uid()
      AND "id" = "Notification"."personId"
    )
  );

CREATE POLICY "System can insert notifications"
  ON "Notification" FOR INSERT
  WITH CHECK (true);
