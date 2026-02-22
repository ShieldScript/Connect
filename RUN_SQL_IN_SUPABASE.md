# Run SQL Scripts in Supabase

PgBouncer (connection pooling) doesn't support Prisma migrations. So we'll run the SQL scripts directly in Supabase SQL Editor.

## Steps

### 1. Create Database Schema

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/sql/new
2. Copy the contents of `prisma/init-schema.sql`
3. Paste into the SQL Editor
4. Click **"Run"** (bottom right)
5. You should see: "Database schema created successfully!"

### 2. Enable PostGIS Extension

1. In the same SQL Editor (or create a new query)
2. Copy the contents of `prisma/migrations/setup-postgis.sql`
3. Paste and click **"Run"**
4. You should see PostGIS version info

### 3. Verify Tables Were Created

Run this query to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- CompatibilityScore
- Group
- GroupMembership
- Interest
- Person
- PersonInterest
- SafetyReport

### 4. Seed Interest Data

Back in your terminal, run:

```bash
npm run db:seed
```

This will populate the database with 80+ interests across 10 categories.

### 5. Verify Everything Works

```bash
npm run db:check
```

Should now show:
- ✅ Database connection successful
- ✅ PostGIS enabled
- ✅ Tables created
- ✅ Ready to go!

---

## What to Do After This

Once the SQL scripts are run, I'll continue building:

1. Level 1 Onboarding Flow
2. Proximity Search with PostGIS
3. Compatibility Matching Algorithm
4. Group CRUD operations
5. And the rest of the MVP features!

Let me know when you've run the SQL scripts and I'll continue!
