# Database Connection Strategy - Optimized for Serverless

## Overview

This project uses **dual connection pooling** to optimize for both **migrations** and **runtime performance** on serverless platforms (Vercel).

---

## Connection Types

### 1. Transaction Pooler (Port 6543) 🚀
**Used by:** Running application (API routes, serverless functions)

**Connection String:**
```
postgresql://postgres.jgicjowvkthdqprncjlo:PASSWORD@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Environment Variable:** `DATABASE_URL`

**Characteristics:**
- ✅ **Optimized for serverless** - Very lightweight, handles high concurrency
- ✅ **Fast connection pooling** - Minimal overhead per request
- ✅ **Works with PgBouncer** - Transaction mode pooling
- ❌ **No prepared statements** - Can't be used for migrations

**Used in:**
- `src/lib/prisma.ts` - Main app database client
- All API routes (`src/app/api/**`)
- Production runtime

**Why:** Serverless functions can spawn hundreds of concurrent connections. Transaction pooler handles this efficiently without exhausting database connections.

---

### 2. Session Pooler (Port 5432) 🔧
**Used by:** Migrations, seeding, database setup

**Connection String:**
```
postgresql://postgres.jgicjowvkthdqprncjlo:PASSWORD@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

**Environment Variable:** `MIGRATION_URL`

**Characteristics:**
- ✅ **Supports prepared statements** - Required by Prisma migrations
- ✅ **Full PostgreSQL features** - No limitations
- ⚠️ **More resource intensive** - Uses more connections per client
- ⚠️ **Not ideal for serverless** - Can exhaust connections under high load

**Used in:**
- `prisma.config.ts` - Prisma migrations
- `prisma/seed.ts` - Database seeding
- `scripts/enable-postgis.ts` - PostGIS setup
- All `npm run db:*` commands

**Why:** Prisma migrations require prepared statements, which Transaction pooler doesn't support. Session pooler provides this at the cost of higher resource usage (acceptable for one-off operations).

---

### 3. Direct Connection (Port 5432) ⚠️
**Used by:** Nothing (kept for reference)

**Connection String:**
```
postgresql://postgres:PASSWORD@db.jgicjowvkthdqprncjlo.supabase.co:5432/postgres
```

**Environment Variable:** `DIRECT_URL`

**Characteristics:**
- ✅ **Full database access** - No pooling overhead
- ❌ **Often blocked by firewall** - Requires IP whitelisting
- ❌ **Not scalable** - Limited connections (default ~100)
- ❌ **Not needed** - Session pooler provides same functionality

**Why not use it:** Direct connection bypasses Supabase's infrastructure and is often blocked by network firewalls. Session pooler provides the same functionality with better availability.

---

## How It Works

### Application Runtime Flow

```
API Request
    ↓
Next.js API Route (src/app/api/*)
    ↓
Prisma Client (src/lib/prisma.ts)
    ↓
DATABASE_URL (Transaction Pooler - Port 6543)
    ↓
PgBouncer (Connection Pooling)
    ↓
PostgreSQL Database
```

**Example:**
```typescript
// src/app/api/persons/me/route.ts
import { prisma } from '@/lib/prisma'; // Uses DATABASE_URL (Transaction pooler)

export async function GET() {
  const person = await prisma.person.findUnique({ ... });
  return NextResponse.json(person);
}
```

### Migration Flow

```
npm run db:migrate
    ↓
Prisma CLI
    ↓
prisma.config.ts
    ↓
MIGRATION_URL (Session Pooler - Port 5432)
    ↓
PostgreSQL Database (with prepared statement support)
```

**Example:**
```bash
# This uses MIGRATION_URL automatically
npm run db:migrate

# Creates migration with prepared statements
npx prisma migrate dev --name add_new_field
```

---

## Configuration Files

### `.env` (Production values)
```bash
# App runtime (Transaction pooler - high concurrency)
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migrations/seeding (Session pooler - prepared statements)
MIGRATION_URL="postgresql://...@...pooler.supabase.com:5432/postgres"
```

### `prisma.config.ts` (Migrations)
```typescript
export default defineConfig({
  datasource: {
    // Uses Session pooler for migrations
    url: process.env.MIGRATION_URL || process.env.DATABASE_URL!,
  },
});
```

### `src/lib/prisma.ts` (App runtime)
```typescript
// Uses Transaction pooler for app
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

### `prisma/seed.ts` (Seeding)
```typescript
// Uses Session pooler for seeding
const pool = new Pool({
  connectionString: process.env.MIGRATION_URL || process.env.DATABASE_URL
});
```

---

## Performance Comparison

| Operation | Transaction Pooler | Session Pooler |
|-----------|-------------------|----------------|
| **Concurrent connections** | 1000s | ~100 |
| **Connection overhead** | ~1ms | ~10ms |
| **Memory per connection** | Low (~10KB) | Higher (~1MB) |
| **Prepared statements** | ❌ No | ✅ Yes |
| **Best for** | Runtime API | Migrations |

---

## Common Commands

### Development
```bash
# Check database connection (uses both)
npm run db:check

# Run migrations (uses MIGRATION_URL)
npm run db:migrate

# Seed database (uses MIGRATION_URL)
npm run db:seed

# View database (uses DATABASE_URL)
npm run db:studio

# Start dev server (uses DATABASE_URL)
npm run dev
```

### Testing Specific Connections

**Test Transaction Pooler (app runtime):**
```bash
# Start dev server and make API request
npm run dev
curl http://localhost:3000/api/persons/me
```

**Test Session Pooler (migrations):**
```bash
# Run a migration
npm run db:migrate
```

---

## Troubleshooting

### "Prepared statement already exists" error
**Cause:** Trying to use Transaction pooler for migrations
**Solution:** Ensure `MIGRATION_URL` is set and uses port 5432

### "Can't reach database server" during migrations
**Cause:** `MIGRATION_URL` not set or incorrect
**Solution:** Check `.env` has `MIGRATION_URL` with port 5432

### High latency in production
**Cause:** Might be using Session pooler instead of Transaction pooler
**Solution:** Verify `DATABASE_URL` uses port 6543 in production environment

### Connection pool exhausted
**Cause:** Too many concurrent connections (unlikely with Transaction pooler)
**Solution:**
1. Verify using Transaction pooler (port 6543)
2. Check for connection leaks (`await prisma.$disconnect()`)
3. Consider Prisma connection pooling settings

---

## Vercel Deployment

When deploying to Vercel, ensure environment variables are set:

**Vercel Dashboard → Project Settings → Environment Variables:**

```
DATABASE_URL = postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true
MIGRATION_URL = postgresql://...@...pooler.supabase.com:5432/postgres
```

**Note:** Migrations should be run **before deployment** or in a **separate deployment step**, not during serverless function runtime.

**Best practice:**
```bash
# In CI/CD or manual deployment
npm run db:migrate  # Uses MIGRATION_URL
vercel deploy       # App uses DATABASE_URL
```

---

## Why This Architecture?

### Problem
Serverless platforms (Vercel, AWS Lambda) can spawn **hundreds of concurrent function invocations**. Each needs a database connection. Traditional connection pooling can't handle this scale.

### Solution
**Transaction pooling (PgBouncer)** acts as a lightweight proxy:
- Maintains a small pool of actual database connections (~10-50)
- Routes thousands of serverless requests through these connections
- Each request gets a connection only for the duration of its transaction
- Connections are immediately returned to the pool

### Trade-off
Transaction pooling disables **prepared statements** (required by Prisma migrations). Solution: Use Session pooler for migrations, Transaction pooler for runtime.

---

## References

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [PgBouncer Transaction Pooling](https://www.pgbouncer.org/features.html)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

## Summary

✅ **Use Transaction Pooler (6543)** for running app
✅ **Use Session Pooler (5432)** for migrations/seeding
✅ **Ignore Direct Connection** (blocked, not needed)
✅ **Set both DATABASE_URL and MIGRATION_URL** in .env

This gives you **best of both worlds**: Scalable serverless runtime + Full PostgreSQL features for migrations.
