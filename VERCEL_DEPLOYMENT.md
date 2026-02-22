# Vercel Deployment Guide

This guide will help you deploy the Brotherhood Discovery Platform to Vercel for testing and review.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Supabase Project**: Already set up with PostgreSQL + PostGIS
4. **Upstash Redis** (Optional): For rate limiting - https://console.upstash.com/

---

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository
5. Click **"Import"**

---

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URLs
# Get from: Supabase Dashboard > Project Settings > Database > Connection String

# Transaction pooler (port 6543) - for API routes
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Session pooler (port 5432) - for migrations
MIGRATION_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:5432/postgres

# Node Environment
NODE_ENV=production
```

### Optional Variables (for rate limiting)

```bash
UPSTASH_REDIS_URL=your-redis-rest-url
UPSTASH_REDIS_TOKEN=your-redis-rest-token
```

### How to Add Variables in Vercel:

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. For each variable:
   - Enter the **Key** (e.g., `DATABASE_URL`)
   - Enter the **Value**
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**

---

## Step 4: Deploy

1. After adding environment variables, click **"Deploy"**
2. Vercel will automatically:
   - Install dependencies
   - Run `prisma generate` (via postinstall)
   - Build your Next.js app
   - Deploy to production

---

## Step 5: Run Database Migration (First Deploy Only)

After the first successful deployment, you need to run migrations on your Supabase database:

### Option A: Run Locally (Recommended)

```bash
# Make sure your .env has MIGRATION_URL set
npx prisma migrate deploy
```

### Option B: Use Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link to your project
vercel link

# Set up environment variables locally
vercel env pull

# Run migration
npx prisma migrate deploy
```

---

## Step 6: Seed Test Data (Optional)

If you want test data for reviewers:

```bash
# Seed interests and test users
npx prisma db seed
```

---

## Step 7: Access Your Deployed App

Your app will be available at:
- Production: `https://your-project-name.vercel.app`
- You can also set up a custom domain in Vercel settings

---

## Troubleshooting

### Build Fails - "Prisma Client not generated"

**Solution**: The `postinstall` script should handle this, but if it fails:
1. Check that `package.json` has `"postinstall": "prisma generate"`
2. Redeploy the project

### Database Connection Issues

**Solution**:
1. Verify `DATABASE_URL` is using the **Transaction pooler** (port 6543)
2. Make sure `?pgbouncer=true` is in the connection string
3. Check Supabase logs for connection errors

### PostGIS Extension Missing

**Solution**: Run this in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Rate Limiting Not Working

**Solution**:
1. Verify `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` are set
2. Check Upstash console for connection errors
3. Rate limiting will gracefully fail if Redis is not configured

---

## Testing Checklist

After deployment, test these features:

- [ ] **Login/Signup** - Authentication works
- [ ] **Onboarding** - Three-phase flow completes
- [ ] **Discovery Map** - CartoDB map loads with markers
- [ ] **Profile** - Can view and edit profile
- [ ] **Circle Creation** - Can create and manage circles
- [ ] **Proximity Search** - Brothers and circles appear based on location
- [ ] **Hover/Click** - List and map sync correctly

---

## Sharing with Reviewers

Share this URL with reviewers:
```
https://your-project-name.vercel.app
```

**Test Credentials** (from seed data):
```
Email: john.warrior@test.com
Password: [Create account or use Supabase auth]

Email: mike.sage@test.com
Password: [Create account or use Supabase auth]
```

**Note**: You'll need to create user accounts in Supabase Auth for test users, or reviewers can sign up directly.

---

## Continuous Deployment

Once set up, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

To disable auto-deployment:
1. Go to **Settings** → **Git**
2. Configure deployment settings

---

## Monitoring

Monitor your deployment:
1. **Vercel Dashboard**: View logs and analytics
2. **Supabase Dashboard**: Monitor database queries
3. **Upstash Dashboard**: Track rate limit usage

---

## Cost Considerations

### Vercel
- **Free Tier**: Sufficient for testing/review
- **Pro**: $20/month if you need more bandwidth

### Supabase
- **Free Tier**: Includes 500MB database, good for testing
- **Pro**: $25/month for production use

### Upstash Redis
- **Free Tier**: 10,000 requests/day
- **Pay-as-you-go**: After free tier

---

## Need Help?

Common issues and solutions:
- Vercel Docs: https://vercel.com/docs
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Supabase Docs: https://supabase.com/docs
