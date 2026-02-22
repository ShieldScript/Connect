-- Enable RLS on HuddleMessage table
ALTER TABLE "HuddleMessage" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages only from their huddles
CREATE POLICY "Users can view their huddle messages"
  ON "HuddleMessage" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "GroupMembership" gm
      WHERE gm."groupId" = "HuddleMessage"."huddleId"
        AND gm."personId" = auth.uid()
        AND gm."status" = 'ACTIVE'
    )
  );

-- Policy: Users can send messages to their huddles
CREATE POLICY "Users can send messages to their huddles"
  ON "HuddleMessage" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "GroupMembership" gm
      WHERE gm."groupId" = "HuddleMessage"."huddleId"
        AND gm."personId" = auth.uid()
        AND gm."status" = 'ACTIVE'
    )
  );

-- Policy: Users can edit/delete their own messages
CREATE POLICY "Users can manage their own messages"
  ON "HuddleMessage" FOR UPDATE
  USING ("senderId" = auth.uid());
