# Setup Guide - Connect App

## Prerequisites
- Node.js 20+ installed
- Supabase account (free tier)
- Git installed

## 1. Supabase Project Setup

### Step 1: Get Database Connection Strings

1. Go to your Supabase project: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo
2. Navigate to **Project Settings** → **Database**
3. Scroll to **Connection String** section
4. Copy the **Connection Pooling** URL (this will be your `DATABASE_URL`)
   - Format: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`
   - ⚠️ **CRITICAL**: Use port **6543** (connection pooling) for serverless functions
5. Copy the **Direct connection** URL (this will be your `DIRECT_URL`)
   - Same URL but with port **5432**
   - Used only for migrations

### Step 2: Get Supabase Keys

1. Navigate to **Project Settings** → **API**
2. Copy the following:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 3: Update .env File

Create a `.env.local` file (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jgicjowvkthdqprncjlo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

DATABASE_URL="postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

NODE_ENV=development
```

**⚠️ IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password from Supabase.

## 2. Enable PostGIS Extension

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this SQL command:

```sql
-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify installation
SELECT PostGIS_version();
```

You should see a version number like "3.4.0" confirming PostGIS is enabled.

## 3. Run Database Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Reset migrations (since we're switching from SQLite to PostgreSQL)
rm -rf prisma/migrations

# Create initial migration
npx prisma migrate dev --name init

# This will:
# - Create all tables (Person, Group, Interest, etc.)
# - Set up indexes
# - Create enums (LocationPrivacy, GroupType, etc.)
```

## 4. Add PostGIS Geography Columns

After running migrations, add geography columns for efficient proximity search:

```bash
# Run this SQL in Supabase SQL Editor:
```

```sql
-- Add geography column to Person table
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);

-- Create spatial index for fast proximity queries
CREATE INDEX IF NOT EXISTS idx_person_location ON "Person" USING GIST(location);

-- Add geography column to Group table
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_group_location ON "Group" USING GIST(location);

-- Optional: Create function to auto-sync lat/lng to geography column
CREATE OR REPLACE FUNCTION sync_person_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for Person
CREATE TRIGGER person_location_sync
  BEFORE INSERT OR UPDATE ON "Person"
  FOR EACH ROW
  EXECUTE FUNCTION sync_person_location();

-- Same for Group
CREATE OR REPLACE FUNCTION sync_group_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_location_sync
  BEFORE INSERT OR UPDATE ON "Group"
  FOR EACH ROW
  EXECUTE FUNCTION sync_group_location();
```

## 5. Seed Initial Data (Optional)

```bash
# Seed interests database
npx prisma db seed
```

## 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

## 7. Verify Setup

Test API endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Ensure you're using port 6543 (connection pooling)
- Verify your IP is allowed in Supabase (check Supabase Settings → Database → Connection Security)

### "Error: P1001: Can't reach database server"
- Check if your database password is correct
- Ensure Supabase project is not paused (free tier pauses after 7 days of inactivity)

### PostGIS functions not found
- Ensure you ran `CREATE EXTENSION IF NOT EXISTS postgis;`
- Verify with `SELECT PostGIS_version();`

### Migration errors
- If you have existing SQLite migrations, delete `prisma/migrations/` folder
- Start fresh with `npx prisma migrate dev --name init`

## Next Steps

1. Test Person API endpoints (`GET /api/persons/me`)
2. Test Interest system
3. Implement onboarding flow
4. Test proximity search with sample data
5. Deploy to Vercel

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- PostGIS Docs: https://postgis.net/docs/
