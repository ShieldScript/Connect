# Database Migration: SQLite → PostgreSQL (Supabase)

## Why This Migration?

The app was initially scaffolded with SQLite for rapid prototyping. However, **PostgreSQL is required** for:

1. ✅ **PostGIS extension** - Geospatial proximity matching (core feature)
2. ✅ **Array types** - Cleaner data model for blockedPersons, safetyFlags, tags
3. ✅ **pgvector extension** - Future AI-powered matching (Phase 2)
4. ✅ **Connection pooling** - Essential for serverless deployment (Vercel)
5. ✅ **Better performance** - Optimized for production workloads

## Migration Status

- [x] Updated Prisma schema (datasource, array types)
- [ ] **ACTION REQUIRED**: Update .env with Supabase database credentials
- [ ] Run database migrations
- [ ] Setup PostGIS extension and geography columns
- [ ] Seed initial Interest data
- [ ] Test proximity queries

---

## Step-by-Step Migration Guide

### Step 1: Get Supabase Database Credentials

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/database

2. **Copy Connection Strings:**

   In the **"Connection string"** section, you'll see:

   **Connection pooling (recommended for serverless):**
   ```
   postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
   ⚠️ **Use port 6543** (pgBouncer connection pooling) - critical for serverless!

   **Direct connection (for migrations only):**
   ```
   postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```
   ⚠️ **Use port 5432** (direct) - only for Prisma migrations

3. **Get Your Password:**
   - If you don't remember it, click "Reset Database Password" in the same section
   - Copy the new password immediately (won't be shown again)

4. **Get Service Role Key (for server-side operations):**
   - Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/api
   - Copy the **`service_role`** key (keep this secret!)

### Step 2: Update .env File

Open `/Users/achi/Sandboxes/Projects/connect/.env` and replace placeholders:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jgicjowvkthdqprncjlo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_99iOk9VcEnDRF802jZdMCA_YMTKj2FX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # PASTE SERVICE ROLE KEY HERE

# Database URLs - REPLACE [PASSWORD] with your actual password
DATABASE_URL="postgresql://postgres.jgicjowvkthdqprncjlo:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jgicjowvkthdqprncjlo:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

NODE_ENV=development
```

**Example with actual password:**
```env
DATABASE_URL="postgresql://postgres.jgicjowvkthdqprncjlo:MySecurePass123!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jgicjowvkthdqprncjlo:MySecurePass123!@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### Step 3: Delete Old SQLite Migrations

```bash
# Remove SQLite migrations (incompatible with PostgreSQL)
rm -rf prisma/migrations

# Remove SQLite database file
rm dev.db dev.db-journal 2>/dev/null || true
```

### Step 4: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply initial migration to PostgreSQL
npx prisma migrate dev --name init

# This creates all tables:
# - Person, Group, GroupMembership
# - Interest, PersonInterest
# - CompatibilityScore
# - SafetyReport
# - Plus all enums and indexes
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"

Applying migration `20240213000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240213000000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### Step 5: Enable PostGIS Extension

**Option A: Via Supabase SQL Editor (Recommended)**

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/sql/new
2. Paste the contents of `prisma/migrations/setup-postgis.sql`
3. Click **"Run"**

**Option B: Via Command Line (if you have psql)**

```bash
psql "$DATABASE_URL" < prisma/migrations/setup-postgis.sql
```

**Verify PostGIS is enabled:**
```sql
SELECT PostGIS_version();
-- Should return: "3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1"
```

### Step 6: Verify Migration Success

```bash
# Open Prisma Studio to view tables
npx prisma studio

# Should open http://localhost:5555
# You should see all tables: Person, Group, Interest, etc.
```

**Or check via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/editor
2. You should see all tables in the Table Editor

### Step 7: Seed Initial Data (Optional)

```bash
# Seed Interest table with sample interests
npx prisma db seed
```

### Step 8: Test Database Connection

```bash
# Start dev server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

---

## Troubleshooting

### ❌ Error: "Can't reach database server"

**Cause:** Incorrect DATABASE_URL or IP not allowed

**Solution:**
1. Check DATABASE_URL has correct password
2. Go to Supabase Dashboard → Settings → Database → Connection Security
3. If using restrictive settings, add your IP or enable "Allow all IP addresses" (for dev)

### ❌ Error: "SSL connection required"

**Cause:** Missing SSL parameter in connection string

**Solution:** Add `?sslmode=require` to DATABASE_URL:
```
DATABASE_URL="...postgres?pgbouncer=true&sslmode=require"
```

### ❌ Error: "Prepared statement already exists"

**Cause:** Using direct connection URL instead of pooled URL

**Solution:** Ensure DATABASE_URL uses port **6543** (not 5432)

### ❌ PostGIS functions not found (e.g., "ST_Distance does not exist")

**Cause:** PostGIS extension not enabled

**Solution:** Run `setup-postgis.sql` in Supabase SQL Editor

### ❌ Migration conflicts

**Cause:** Old SQLite migrations interfering

**Solution:**
```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## What Changed?

### Prisma Schema Updates

| Before (SQLite) | After (PostgreSQL) |
|-----------------|-------------------|
| `provider = "sqlite"` | `provider = "postgresql"` |
| `safetyFlags String?` (JSON string) | `safetyFlags String[]` (array) |
| `blockedPersons String?` (JSON string) | `blockedPersons String[]` (array) |
| `leaderIds String?` (JSON string) | `leaderIds String[]` (array) |
| `tags String?` (JSON string) | `tags String[]` (array) |
| No `directUrl` | `directUrl = env("DIRECT_URL")` |

### New Geospatial Capabilities

After PostGIS setup, Person and Group tables have:
- `location` column (GEOGRAPHY type)
- Spatial indexes for fast proximity queries
- Automatic triggers to sync `latitude`/`longitude` → `location`

### Connection Pooling (Serverless-Ready)

- ✅ **DATABASE_URL** uses pgBouncer (port 6543) - handles 1000s of serverless invocations
- ✅ **DIRECT_URL** uses direct connection (port 5432) - only for migrations

---

## Rollback Plan (If Needed)

If you need to rollback to SQLite temporarily:

```bash
# 1. Restore old schema
git checkout HEAD -- prisma/schema.prisma

# 2. Update .env
DATABASE_URL="file:./dev.db"

# 3. Regenerate client
npx prisma generate

# 4. Restart dev server
npm run dev
```

**⚠️ Warning:** SQLite won't support proximity matching. This is only for emergency rollback.

---

## Next Steps After Migration

Once migration is complete:

1. ✅ Test Person API endpoints
2. ✅ Implement proximity search functions
3. ✅ Test geospatial queries with sample data
4. ✅ Implement matching algorithm
5. ✅ Deploy to Vercel

See **SETUP.md** for full implementation guide.

---

## Need Help?

- **Supabase Issues:** https://supabase.com/docs/guides/database
- **Prisma Issues:** https://www.prisma.io/docs/guides/migrate
- **PostGIS Issues:** https://postgis.net/docs/
