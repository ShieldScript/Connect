# Seed Test Users for Development

## Quick Start

### 1. Get Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/api
2. Scroll to **"Service role"** section (⚠️ Keep this secret!)
3. Click **"Reveal"** button
4. Copy the key (starts with `eyJ...`)

### 2. Update .env

Open `.env` and replace this line:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

With your actual key:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never commit this key to git! It's already in `.gitignore`.

### 3. Run the Seed Script

```bash
npm run db:seed:users
```

## What Gets Created

The script creates 3 test users in both **Supabase Auth** and the **Person** table:

| Email | Password | Display Name | Onboarding Status |
|-------|----------|--------------|-------------------|
| `gil.motina@servingtheking.com` | `testpass123` | Gil Motina | Not started (level 0) |
| `paul.lau@servingtheking.com` | `testpass123` | Paul Lau | Not started (level 0) |
| `allen.chi@servingtheking.com` | `testpass123` | Allen Chi | Not started (level 0) |

### Features

- ✅ **Email auto-confirmed** (no confirmation email needed)
- ✅ **Ready for onboarding** (onboardingLevel = 0)
- ✅ **Idempotent** (safe to run multiple times - won't create duplicates)
- ✅ **Resets onboarding** (if user already exists, resets to level 0)

## How to Test

### Sign In

1. Go to http://localhost:3000/login
2. Use any of the test user credentials above
3. Click "Sign In"

### Test Onboarding Flow

After signing in, you should:
1. See the home page showing "Onboarding: Incomplete"
2. Click "Start Onboarding" button
3. Go through the onboarding flow (when implemented)

## Troubleshooting

### "Service role key not set" error

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` in `.env` is still the placeholder

**Solution:** Follow Step 1-2 above to get and set the actual key

### "User already exists" message

**Expected behavior!** The script detects existing users and updates their Person record instead. This is by design - you can re-run the script to reset test users.

### "Could not find existing user"

**Cause:** User exists in Supabase Auth but has a different email

**Solution:**
1. Delete the user in Supabase Dashboard → Authentication → Users
2. Run the script again

### Can't sign in after seeding

**Cause:** Cookies from previous session might be cached

**Solution:**
1. Clear browser cookies for localhost:3000
2. Or use incognito/private browsing mode
3. Try signing in again

## Resetting Test Users

To reset all test users to onboarding level 0:

```bash
# Just re-run the script
npm run db:seed:users
```

This will:
- Keep existing Supabase Auth users
- Reset Person records to onboardingLevel = 0
- Remove any interests, preferences, etc.

## Production Warning

⚠️ **NEVER run this script in production!**

This script is for **development only**. It:
- Creates users with weak passwords
- Auto-confirms emails (skips verification)
- Uses the service role key (has admin access)

For production, always use:
- The signup flow (`/api/auth/signup`)
- Email confirmation enabled
- Strong user passwords
- Regular (non-admin) API keys

---

## What's Next?

Once test users are seeded, you can:

1. **Test the signup/login flow** - Verify existing functionality works
2. **Implement onboarding** - Build the 5-7 question onboarding flow
3. **Test with multiple users** - Create groups, test proximity, matching
4. **Add more test data** - Seed groups, memberships, etc.

See `IMPLEMENTATION_STATUS.md` for the full roadmap.
