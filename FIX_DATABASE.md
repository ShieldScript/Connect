# 🔧 Database Fix Required

The `proximityRadiusKm` column needs to be added to your database.

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://jgicjowvkthdqprncjlo.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL
Copy and paste this entire block, then click **Run** (or press Cmd+Enter):

```sql
-- Add proximityRadiusKm column to Person table
ALTER TABLE "Person"
ADD COLUMN IF NOT EXISTS "proximityRadiusKm" INTEGER DEFAULT 5;
```

### Step 3: Verify
You should see: `ALTER TABLE`

That's it! The app will now work properly.

---

## What This Does
- Adds a new column to store each user's preferred search radius
- Sets the default to 5km for all existing users
- Uses `IF NOT EXISTS` so it's safe to run multiple times

## After Running
- Radius saving will work in The Forge
- Radius changes will persist across all pages
- No data loss or downtime
