# Get Supabase Connection Strings

## Step-by-Step Guide

### 1. Open Supabase Database Settings

Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/database

### 2. Find "Connection string" Section

Scroll down to the **"Connection string"** section.

### 3. Get DATABASE_URL (Transaction Pooler)

1. In the dropdown, select **"Transaction"**
2. You'll see a connection string like:
   ```
   postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
3. **Important:** Port should be **6543**
4. Copy this entire string
5. In your `.env` file, replace the `DATABASE_URL` line with:
   ```env
   DATABASE_URL="postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
   (Add `?pgbouncer=true` at the end if not already there)

### 4. Get DIRECT_URL (Direct Connection)

1. In the same dropdown, select **"Direct connection"** (or "Session")
2. You'll see a connection string like:
   ```
   postgresql://postgres.jgicjowvkthdqprncjlo:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```
3. **Important:** Port should be **5432** (different from DATABASE_URL!)
4. Copy this entire string
5. In your `.env` file, replace the `DIRECT_URL` line with this string

### 5. Replace [YOUR-PASSWORD]

In both URLs, replace `[YOUR-PASSWORD]` with your actual database password.

**Don't know your password?**
- Scroll down in the same page to "Database password"
- Click **"Reset database password"**
- Copy the new password immediately (it won't be shown again)
- Use this password in BOTH connection strings

### 6. Example of Completed .env

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jgicjowvkthdqprncjlo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_99iOk9VcEnDRF802jZdMCA_YMTKj2FX
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URLs
DATABASE_URL="postgresql://postgres.jgicjowvkthdqprncjlo:MyActualPassword123!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jgicjowvkthdqprncjlo:MyActualPassword123!@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# Node Environment
NODE_ENV=development
```

### 7. Test Connection

After updating `.env`, test the connection:

```bash
# Install tsx for running TypeScript scripts
npm install -D tsx

# Test database connection
npx tsx scripts/check-db-connection.ts
```

## Quick Visual Guide

```
Supabase Database Settings
   └─ Connection string
      ├─ [Dropdown: Transaction] ← Use this for DATABASE_URL (port 6543)
      └─ [Dropdown: Direct connection] ← Use this for DIRECT_URL (port 5432)
```

## Troubleshooting

### "Password authentication failed"
- Reset your database password in Supabase settings
- Make sure the password is the same in both DATABASE_URL and DIRECT_URL

### "Connection timeout"
- Check if your Supabase project is paused (free tier pauses after 7 days)
- Check your internet connection
- Go to Supabase dashboard to "wake up" the project

### "Can't find .env file"
- Make sure you're running commands from `/Users/achi/Sandboxes/Projects/connect`
- The `.env` file should be in the root of the project

---

Once you have the connection strings in `.env`, let me know and I'll test the connection and proceed with migrations!
