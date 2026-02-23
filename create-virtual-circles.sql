-- Create virtual/online circles (accessible from anywhere, no location required)

-- Get some user IDs to be creators
DO $$
DECLARE
  user1_id text;
  user2_id text;
  user3_id text;
  circle1_id text;
  circle2_id text;
  circle3_id text;
BEGIN
  -- Get first 3 onboarded users
  SELECT id INTO user1_id FROM "Person" WHERE "onboardingLevel" >= 1 LIMIT 1 OFFSET 0;
  SELECT id INTO user2_id FROM "Person" WHERE "onboardingLevel" >= 1 LIMIT 1 OFFSET 1;
  SELECT id INTO user3_id FROM "Person" WHERE "onboardingLevel" >= 1 LIMIT 1 OFFSET 2;

  -- Create online circle 1: Global Prayer Warriors
  INSERT INTO "Group" (
    id, name, description, protocol, type, category,
    "locationName", "currentSize", "maxSize", tags,
    "isVirtual", "isPublic", status, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Global Prayer Warriors',
    'Daily online prayer meetings for brothers around the world. Join us weekdays at 6 AM EST for morning prayer.',
    'Join via the weekly Zoom link sent to members',
    'SPIRITUAL',
    'CIRCLE',
    'Online',
    1,
    50,
    ARRAY['prayer', 'faith', 'global', 'morning'],
    true,
    true,
    'ACTIVE',
    user1_id,
    NOW(),
    NOW()
  ) RETURNING id INTO circle1_id;

  -- Add creator as leader
  INSERT INTO "GroupMembership" (
    id, "groupId", "personId", role, status, "joinedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), circle1_id, user1_id, 'LEADER', 'ACTIVE', NOW(), NOW(), NOW()
  );

  -- Create online circle 2: Tech Bros Connect
  INSERT INTO "Group" (
    id, name, description, protocol, type, category,
    "locationName", "currentSize", "maxSize", tags,
    "isVirtual", "isPublic", status, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Tech Bros Connect',
    'Weekly video calls for brothers in tech to share knowledge, career advice, and support each other in the industry.',
    'Meets Thursdays at 7 PM EST on Google Meet',
    'PROFESSIONAL',
    'CIRCLE',
    'Online',
    1,
    30,
    ARRAY['technology', 'career', 'networking', 'mentorship'],
    true,
    true,
    'ACTIVE',
    user2_id,
    NOW(),
    NOW()
  ) RETURNING id INTO circle2_id;

  -- Add creator as leader
  INSERT INTO "GroupMembership" (
    id, "groupId", "personId", role, status, "joinedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), circle2_id, user2_id, 'LEADER', 'ACTIVE', NOW(), NOW(), NOW()
  );

  -- Create online circle 3: Virtual Book Club
  INSERT INTO "Group" (
    id, name, description, protocol, type, category,
    "locationName", "currentSize", "maxSize", tags,
    "isVirtual", "isPublic", status, "createdBy", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Virtual Book Club',
    'Monthly online discussions on books about faith, leadership, and personal growth. Current read: The Brothers Karamazov.',
    'First Monday of each month at 8 PM EST',
    'SOCIAL',
    'CIRCLE',
    'Online',
    1,
    20,
    ARRAY['books', 'learning', 'discussion', 'growth'],
    true,
    true,
    'ACTIVE',
    user3_id,
    NOW(),
    NOW()
  ) RETURNING id INTO circle3_id;

  -- Add creator as leader
  INSERT INTO "GroupMembership" (
    id, "groupId", "personId", role, status, "joinedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), circle3_id, user3_id, 'LEADER', 'ACTIVE', NOW(), NOW(), NOW()
  );

  RAISE NOTICE '✅ Created 3 online circles successfully!';
END $$;
