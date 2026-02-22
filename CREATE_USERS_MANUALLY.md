# Create Test Users Manually (No Service Role Key Needed)

If you can't find the service role key, you can create test users directly in Supabase Dashboard.

## Method 1: Via Supabase Dashboard

### Step 1: Create Users in Supabase Auth

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/auth/users
2. Click **"Add user"** button (top right)
3. Fill in the form:
   - **Email:** `gil.motina@servingtheking.com`
   - **Password:** `testpass123`
   - ✅ **Auto Confirm User** (check this box!)
4. Click **"Create user"**
5. Repeat for:
   - `paul.lau@servingtheking.com`
   - `allen.chi@servingtheking.com`

### Step 2: Create Person Records

After creating each Supabase user, you need to create their Person record:

1. Open Prisma Studio: `npm run db:studio`
2. Click on **"Person"** table
3. Click **"Add record"** button
4. Fill in:
   - **supabaseUserId:** Copy from Supabase user (UUID format)
   - **email:** `gil.motina@servingtheking.com`
   - **displayName:** `Gil Motina`
   - **onboardingLevel:** `0`
5. Click **"Save 1 change"**
6. Repeat for other users

### Getting the supabaseUserId:

1. In Supabase Dashboard (https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/auth/users)
2. Click on the user you just created
3. Copy the **"UID"** (looks like: `a1b2c3d4-...`)
4. Use this as `supabaseUserId` in Prisma Studio

---

## Method 2: Via SQL (Fastest!)

### Step 1: Create Supabase Auth Users

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/sql/new
2. Paste and run this SQL:

```sql
-- Note: This might fail if email confirmation is required
-- If it fails, use Method 1 (Dashboard) instead

-- Insert user 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'gil.motina@servingtheking.com',
  crypt('testpass123', gen_salt('bf')),
  NOW(),
  '{"display_name": "Gil Motina"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Repeat for other users...
```

Actually, this is complex. **Use Method 1 (Dashboard) - it's much simpler!**

---

## Method 3: Use Signup API (Recommended!)

Actually, the easiest way is to just use the signup form:

### Step 1: Disable Email Confirmation

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/auth/providers
2. Scroll to **"Email"** section
3. Find **"Confirm email"** toggle
4. **Turn it OFF**
5. Click **"Save"**

### Step 2: Sign Up Through the App

1. Go to http://localhost:3000/login
2. Click **"Don't have an account? Sign Up"**
3. Fill in:
   - Display Name: `Gil Motina`
   - Email: `gil.motina@servingtheking.com`
   - Password: `testpass123`
4. Click **"Sign Up"**
5. You should be automatically signed in!

Repeat for the other two users (sign out first, then sign up again).

This method:
- ✅ Automatically creates both Supabase Auth user AND Person record
- ✅ No need for service role key
- ✅ Uses the same flow as real users
- ✅ Works immediately

---

## Which Method Should I Use?

**Recommended: Method 3 (Signup API)**
- Easiest and fastest
- Tests the real signup flow
- No need for admin access

**Use Method 1 (Dashboard)** if:
- You want to keep email confirmation enabled
- You want full control over user creation

**Skip Method 2** - It's too complex for development

---

## After Creating Users

Test sign in:
1. Go to http://localhost:3000/login
2. Enter email: `gil.motina@servingtheking.com`
3. Password: `testpass123`
4. Click "Sign In"

You should see the home page! 🎉
