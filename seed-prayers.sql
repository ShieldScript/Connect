-- Seed Prayer Requests
-- Run this in Supabase SQL Editor after executing the RLS policies

-- First, let's get some user IDs (you'll see these in the results)
-- SELECT id, "displayName" FROM "Person" WHERE "onboardingLevel" >= 1 LIMIT 10;

-- Replace USER_ID_1, USER_ID_2, etc. with actual user IDs from your database
-- Or use this dynamic approach:

DO $$
DECLARE
    user_ids text[];
    user_id text;
    prayer_id text;
    respondent_id text;
    i int;
    j int;
    num_responses int;
BEGIN
    -- Get array of onboarded user IDs
    SELECT array_agg(id) INTO user_ids
    FROM "Person"
    WHERE "onboardingLevel" >= 1
    LIMIT 20;

    IF array_length(user_ids, 1) IS NULL OR array_length(user_ids, 1) < 2 THEN
        RAISE EXCEPTION 'Not enough users found. Please create some users first.';
    END IF;

    -- Prayer 1
    SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO user_id;
    INSERT INTO "PrayerPost" (id, "authorId", content, "prayerCount", "createdAt")
    VALUES (
        gen_random_uuid(),
        user_id,
        'Please pray for my family. We''re going through a difficult financial season and need God''s provision and wisdom.',
        12,
        NOW() - INTERVAL '2 days'
    ) RETURNING id INTO prayer_id;

    -- Add responses for Prayer 1
    FOR i IN 1..12 LOOP
        SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO respondent_id;
        IF respondent_id != user_id THEN
            INSERT INTO "PrayerResponse" (id, "prayerPostId", "prayerId", "createdAt")
            VALUES (gen_random_uuid(), prayer_id, respondent_id, NOW() - INTERVAL '1 day')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    -- Prayer 2
    SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO user_id;
    INSERT INTO "PrayerPost" (id, "authorId", content, "prayerCount", "createdAt")
    VALUES (
        gen_random_uuid(),
        user_id,
        'Praying for strength as I battle anxiety. Some days are harder than others. Trusting God to give me peace.',
        8,
        NOW() - INTERVAL '3 days'
    ) RETURNING id INTO prayer_id;

    FOR i IN 1..8 LOOP
        SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO respondent_id;
        IF respondent_id != user_id THEN
            INSERT INTO "PrayerResponse" (id, "prayerPostId", "prayerId", "createdAt")
            VALUES (gen_random_uuid(), prayer_id, respondent_id, NOW() - INTERVAL '2 days')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    -- Prayer 3
    SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO user_id;
    INSERT INTO "PrayerPost" (id, "authorId", content, "prayerCount", "createdAt")
    VALUES (
        gen_random_uuid(),
        user_id,
        'My father is in the hospital recovering from surgery. Please pray for his healing and the doctors treating him.',
        15,
        NOW() - INTERVAL '1 day'
    ) RETURNING id INTO prayer_id;

    FOR i IN 1..15 LOOP
        SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO respondent_id;
        IF respondent_id != user_id THEN
            INSERT INTO "PrayerResponse" (id, "prayerPostId", "prayerId", "createdAt")
            VALUES (gen_random_uuid(), prayer_id, respondent_id, NOW() - INTERVAL '12 hours')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    -- Prayer 4
    SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO user_id;
    INSERT INTO "PrayerPost" (id, "authorId", content, "prayerCount", "createdAt")
    VALUES (
        gen_random_uuid(),
        user_id,
        'Starting a new job next week and feeling nervous. Pray for confidence and that I can be a light in this workplace.',
        6,
        NOW() - INTERVAL '5 hours'
    ) RETURNING id INTO prayer_id;

    FOR i IN 1..6 LOOP
        SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO respondent_id;
        IF respondent_id != user_id THEN
            INSERT INTO "PrayerResponse" (id, "prayerPostId", "prayerId", "createdAt")
            VALUES (gen_random_uuid(), prayer_id, respondent_id, NOW() - INTERVAL '3 hours')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    -- Prayer 5
    SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO user_id;
    INSERT INTO "PrayerPost" (id, "authorId", content, "prayerCount", "createdAt")
    VALUES (
        gen_random_uuid(),
        user_id,
        'Struggling with doubt in my faith journey. Pray that God would strengthen my belief and draw me closer to Him.',
        10,
        NOW() - INTERVAL '4 days'
    ) RETURNING id INTO prayer_id;

    FOR i IN 1..10 LOOP
        SELECT user_ids[1 + floor(random() * array_length(user_ids, 1))] INTO respondent_id;
        IF respondent_id != user_id THEN
            INSERT INTO "PrayerResponse" (id, "prayerPostId", "prayerId", "createdAt")
            VALUES (gen_random_uuid(), prayer_id, respondent_id, NOW() - INTERVAL '3 days')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    RAISE NOTICE 'Successfully seeded 5 prayer requests with responses!';
END $$;
