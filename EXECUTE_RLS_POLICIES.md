# Execute RLS Policies - Quick Guide

## Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

## Step 2: Copy & Execute SQL

Copy the entire contents of `/Users/achi/Sandboxes/Projects/connect/supabase-rls-prayers.sql` and paste into the SQL Editor.

Or run directly from terminal:

```bash
# If you have Supabase CLI installed
cat supabase-rls-prayers.sql
```

## Step 3: Verify Execution

After running the SQL, you should see:

```
Success: Policies created successfully
```

## Step 4: Verify Tables

Run this query to verify RLS is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('PrayerPost', 'PrayerResponse', 'Notification');
```

Expected result:
```
tablename        | rowsecurity
-----------------+------------
PrayerPost       | t
PrayerResponse   | t
Notification     | t
```

## Step 5: Verify Policies

Run this query to list all policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('PrayerPost', 'PrayerResponse', 'Notification')
ORDER BY tablename, policyname;
```

Expected policies:
- PrayerPost: 3 policies (SELECT, INSERT, UPDATE)
- PrayerResponse: 2 policies (SELECT, INSERT)
- Notification: 3 policies (SELECT, UPDATE, INSERT)

## Troubleshooting

### Error: "policy already exists"

If you see errors about policies already existing, drop them first:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active prayers" ON "PrayerPost";
DROP POLICY IF EXISTS "Onboarded users can create prayers" ON "PrayerPost";
DROP POLICY IF EXISTS "Authors can update their prayers" ON "PrayerPost";
DROP POLICY IF EXISTS "Anyone can view prayer responses" ON "PrayerResponse";
DROP POLICY IF EXISTS "Users can create prayer responses" ON "PrayerResponse";
DROP POLICY IF EXISTS "Users can view their own notifications" ON "Notification";
DROP POLICY IF EXISTS "Users can update their own notifications" ON "Notification";
DROP POLICY IF EXISTS "System can insert notifications" ON "Notification";
```

Then re-run the RLS policies SQL.

### Error: "relation does not exist"

This means the tables haven't been created yet. Run:

```bash
npx prisma db push
```

Then try executing the RLS policies again.

---

## Done! 🎉

Once the RLS policies are executed, the Prayer Wall feature is fully functional and ready to use!
