# Deployment Guide - Vercel + Supabase

**Date**: March 1, 2026

---

## Pre-Deployment Checklist

### ✅ Recent Changes Summary (87 files)
- [x] Onboarding flow restructured (18 → 19 steps)
- [x] Code of Conduct merged into Covenant
- [x] Pure HEXACO personality analysis added
- [x] DNA alignment analysis with AI
- [x] Smart caching with localStorage
- [x] Temperature lowered for consistency (0.8 → 0.4)
- [x] Ministry experiences & practices now sent to AI
- [x] All emoji icons replaced with abstract icons
- [x] All totalSteps updated to 19
- [x] Sidebar updated to new structure

---

## Step 1: Commit All Changes

```bash
# Stage all changes
git add .

# Create comprehensive commit
git commit -m "$(cat <<'EOF'
Major onboarding flow improvements and AI analysis enhancements

## Onboarding Flow Changes (19 steps, was 20)
- Merged Code of Conduct into Covenant page (cleaner UX)
- Updated sidebar to show 5 chapters: Identity, Stewardship, Rhythms, DNA Discovery, Commitment
- Fixed all routing and step numbers across 19 pages
- Updated welcome page to reflect new structure

## AI Analysis Enhancements
- Added pure HEXACO personality analysis (separate from alignment)
- DNA Reveal now shows 2 sections:
  1. Your Personality (pure temperament)
  2. How Your DNA Aligns with Your Calling (stewardship alignment)
- Lowered AI temperature (0.8 → 0.4) for consistency
- Implemented smart caching in localStorage
- Auto-regeneration when user edits stewardship data
- Send ministry experiences & practices types to AI (not just counts)

## UI Improvements
- Replaced all emoji icons with abstract lucide-react icons
- Cleaner section headers and dividers
- Better visual hierarchy with gradient separators

## Data Privacy
- Only send PUBLIC data to AI
- Ministry experiences and practices now included for better insights
- No PII sent to external services

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# Push to GitHub
git push origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set project name: brotherhood-connect
# - Framework: Next.js
# - Root directory: ./
# - Build command: npm run build
# - Output directory: .next
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click "Deploy"

---

## Step 3: Configure Environment Variables in Vercel

### Required Environment Variables

Go to Vercel Dashboard → Project → Settings → Environment Variables

Add these:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### How to Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Go to **Settings** → **Database**
6. Copy connection strings:
   - Connection pooling → `DATABASE_URL` (port 6543)
   - Direct connection → `DIRECT_URL` (port 5432)

### How to Get Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key → `GEMINI_API_KEY`

---

## Step 4: Database Migration on Supabase

### Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Supabase (creates tables)
npx prisma db push

# (Optional) Run seed data
npx prisma db seed
```

### Verify Database Setup

1. Go to Supabase Dashboard → **Table Editor**
2. Check that these tables exist:
   - Person
   - Interest
   - PersonInterest
   - Group
   - GroupMembership
   - NaturalGifting
   - SupernaturalGifting
   - MinistryExperience
   - Milestone
   - GrowthArea
   - LeadershipPattern
   - LifeStage
   - Calling
   - HealingTheme
   - Practice
   - Boundary

---

## Step 5: Test Production Deployment

### Test Checklist

1. **Authentication**
   - [ ] Sign up with new account
   - [ ] Sign in with existing account
   - [ ] Password reset works

2. **Onboarding Flow**
   - [ ] Complete all 19 steps
   - [ ] HEXACO-60 assessment works
   - [ ] DNA Reveal shows both analyses:
     - [ ] Pure HEXACO personality
     - [ ] DNA alignment with calling
   - [ ] Covenant page shows (not Code of Conduct)
   - [ ] Final submission creates profile

3. **AI Analysis**
   - [ ] Pure HEXACO analysis generates
   - [ ] DNA alignment analysis generates
   - [ ] Results are cached
   - [ ] Edit stewardship data → regenerates

4. **Dashboard**
   - [ ] Profile displays correctly
   - [ ] Nearby brothers show
   - [ ] Group recommendations work

---

## Step 6: Monitor and Debug

### View Deployment Logs

```bash
# Vercel CLI
vercel logs --follow

# Or in Vercel Dashboard
# Go to Deployments → Latest → View Logs
```

### Check for Common Issues

**Issue 1: Database Connection Failed**
```
Fix: Verify DATABASE_URL in Vercel env vars
     Make sure port 6543 is used (transaction pooling)
```

**Issue 2: Gemini API Quota Exceeded**
```
Fix: Free tier has 20 requests/day
     Consider upgrading to paid tier
     Fallback analysis will work automatically
```

**Issue 3: Missing Environment Variables**
```
Fix: Re-deploy after adding env vars in Vercel
     vercel --prod
```

**Issue 4: Prisma Generate Failed**
```
Fix: Add build command to package.json:
     "build": "prisma generate && next build"
```

---

## Step 7: Post-Deployment Tasks

### 1. Update App URL

If your domain changed, update:

```bash
# In Vercel env vars
NEXT_PUBLIC_APP_URL=https://your-new-domain.vercel.app
```

### 2. Configure Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (auto-provisioned)

### 3. Enable Analytics (Optional)

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### Build Fails on Vercel

**Error**: `Type error: Cannot find module 'prisma/enums/...'`

**Fix**: Ensure prisma generate runs before build
```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Database Connection Issues

**Error**: `Can't reach database server`

**Fix**: Use transaction pooling (port 6543) in DATABASE_URL
```
DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true
```

### AI Analysis Not Working

**Error**: API returns 429 or 500

**Fix**: Check Gemini API key in Vercel env vars
- Verify key is valid
- Check quota (free tier: 20/day)
- Fallback analysis will work automatically

---

## Quick Deploy Command (All-in-One)

```bash
# Complete deployment in one command
git add . && \
git commit -m "Deploy: Onboarding improvements + AI analysis" && \
git push origin main && \
vercel --prod
```

---

## Rollback (If Needed)

```bash
# Vercel Dashboard → Deployments → Previous → Promote to Production

# Or CLI
vercel rollback
```

---

**Estimated Time**: 15-30 minutes

**Prerequisites**:
- Vercel account
- Supabase project
- Gemini API key
- GitHub repository

**Support**: https://vercel.com/docs | https://supabase.com/docs

---

**Last Updated**: March 1, 2026
