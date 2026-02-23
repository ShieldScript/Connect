-- CreateFunction: Calculate nearby person count using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_count(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  user_id TEXT
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::int
    FROM "Person" p
    WHERE p."onboardingLevel" >= 1
      AND ST_DWithin(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_km * 1000
      )
      AND p.location IS NOT NULL
      AND p.id != user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- CreateFunction: Calculate unread huddle messages count
CREATE OR REPLACE FUNCTION get_unread_huddle_count(
  huddle_id TEXT,
  person_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  last_read TIMESTAMP;
BEGIN
  -- Get the last read timestamp for this person in this huddle
  SELECT COALESCE(gm."lastReadAt", gm."joinedAt", '1970-01-01'::timestamp)
  INTO last_read
  FROM "GroupMembership" gm
  WHERE gm."groupId" = huddle_id
    AND gm."personId" = person_id
  LIMIT 1;

  -- Count unread messages
  RETURN (
    SELECT COUNT(*)::int
    FROM "HuddleMessage" hm
    WHERE hm."huddleId" = huddle_id
      AND hm."senderId" != person_id
      AND hm."deletedAt" IS NULL
      AND hm."createdAt" > last_read
  );
END;
$$ LANGUAGE plpgsql STABLE;
