# Implementation Status - Connect App MVP

## Overview
Building a person-first, proximity-aware social connection platform using Next.js (serverless on Vercel) + Supabase (PostgreSQL + Auth) + React Native (Expo).

**Target:** 8-10 week MVP launch
**Budget:** $0 (using free tiers)

---

## Phase 1: Backend Foundation (Weeks 1-4)

### ✅ Week 1: Project Setup & Database Migration (CURRENT)

#### Completed:
- [x] Next.js 14+ project initialized with TypeScript
- [x] Dependencies installed (Prisma, Supabase, Upstash Redis, Zod)
- [x] Prisma schema defined (Person, Group, Interest, etc.)
- [x] **Migrated from SQLite to PostgreSQL**
  - [x] Updated datasource to postgresql
  - [x] Changed JSON strings to proper array types
  - [x] Added directUrl for migrations
  - [x] Created migration guide (DATABASE_MIGRATION.md)
  - [x] Created PostGIS setup script (setup-postgis.sql)
- [x] Supabase client setup (server + client)
- [x] Prisma client singleton (serverless-ready)
- [x] Basic file structure in place

#### ⏳ Pending (User Action Required):
- [ ] **ACTION: Update .env with Supabase database credentials**
  - [ ] Get DATABASE_URL (connection pooling, port 6543)
  - [ ] Get DIRECT_URL (direct connection, port 5432)
  - [ ] Get SUPABASE_SERVICE_ROLE_KEY
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Enable PostGIS extension in Supabase
- [ ] Run setup-postgis.sql script

---

### 🔄 Week 2-3: Person Layer

#### To Do:
- [ ] Person CRUD API endpoints
  - [ ] POST /api/auth/signup (Supabase Auth + Person record)
  - [ ] GET /api/persons/me (current user)
  - [ ] PATCH /api/persons/me (update profile)
  - [ ] GET /api/persons/:id (view other person, privacy-filtered)
  - [ ] POST /api/persons/me/location (update location)

- [ ] Interest System
  - [ ] Create seed data (50-100 interests)
  - [ ] GET /api/interests (list all)
  - [ ] POST /api/persons/me/interests (add interests)
  - [ ] DELETE /api/persons/me/interests/:id (remove)

- [ ] Level 1 Onboarding
  - [ ] Define onboarding questions (src/config/onboarding.ts)
  - [ ] POST /api/persons/me/onboarding (complete onboarding)
  - [ ] Validation with Zod
  - [ ] Update Person record (interests, preferences, traits)

- [ ] Privacy & Location
  - [ ] Implement getVisibleLocation() (EXACT, APPROXIMATE, CITY_ONLY, HIDDEN)
  - [ ] Implement getVisibleProfile() (privacy filtering)
  - [ ] Location update endpoint with privacy controls

**Files to Create:**
- src/lib/services/personService.ts
- src/lib/services/onboardingService.ts
- src/config/onboarding.ts
- src/app/api/persons/me/route.ts
- src/app/api/persons/[id]/route.ts
- src/app/api/interests/route.ts
- src/app/api/persons/me/interests/route.ts
- src/app/api/persons/me/onboarding/route.ts
- prisma/seed.ts (Interest data)

---

### 🔄 Week 4: Basic Matching Engine

#### To Do:
- [ ] Proximity Search (PostGIS)
  - [ ] Create findPersonsNearby() function
  - [ ] Use ST_Distance and ST_DWithin
  - [ ] Filter blocked users
  - [ ] Respect location privacy settings

- [ ] Compatibility Algorithm
  - [ ] Implement calculateCompatibility()
    - [ ] Jaccard similarity for interests
    - [ ] Inverse distance for proximity
    - [ ] Weighted overall score
  - [ ] Generate match reasons
  - [ ] Create findCompatiblePersons()

- [ ] Matching API
  - [ ] GET /api/matches/persons (recommended persons)
  - [ ] Cache matches in CompatibilityScore table
  - [ ] Implement 7-day expiration
  - [ ] Trigger initial matches after onboarding

**Files to Create:**
- src/lib/services/proximityService.ts
- src/lib/matching/compatibilityEngine.ts
- src/app/api/matches/persons/route.ts

---

## Phase 2: Group Layer (Weeks 5-6)

### 🔄 Week 5: Group CRUD & Membership

#### To Do:
- [ ] Group CRUD
  - [ ] POST /api/groups (create)
  - [ ] GET /api/groups/:id (details)
  - [ ] PATCH /api/groups/:id (update - leaders only)
  - [ ] DELETE /api/groups/:id (archive - creator only)

- [ ] Group Membership
  - [ ] POST /api/groups/:id/join (request to join)
  - [ ] POST /api/groups/:id/leave (leave group)
  - [ ] GET /api/groups/:id/members (list members)
  - [ ] POST /api/groups/:id/members/:personId/approve (leader)
  - [ ] POST /api/groups/:id/members/:personId/remove (leader)

**Files to Create:**
- src/lib/services/groupService.ts
- src/app/api/groups/route.ts
- src/app/api/groups/[id]/route.ts
- src/app/api/groups/[id]/join/route.ts
- src/app/api/groups/[id]/leave/route.ts
- src/app/api/groups/[id]/members/route.ts

---

### 🔄 Week 6: Group Discovery

#### To Do:
- [ ] Proximity Search (PostGIS)
  - [ ] Create findGroupsNearby() function
  - [ ] Filters (type, tags, distance, size)
  - [ ] Sort by distance/relevance

- [ ] Group Recommendations
  - [ ] Implement recommendGroups()
    - [ ] Interest overlap (tags vs person interests)
    - [ ] Proximity score
    - [ ] Size preference match
  - [ ] Generate match reasons
  - [ ] GET /api/matches/groups

**Files to Create:**
- src/lib/services/groupDiscoveryService.ts
- src/app/api/groups/nearby/route.ts
- src/app/api/matches/groups/route.ts

---

## Phase 3: Mobile App (Weeks 7-8)

### 🔄 Week 7: App Foundation

#### To Do:
- [ ] Initialize Expo project
- [ ] Setup navigation (React Navigation)
- [ ] Supabase Auth integration
  - [ ] Sign up screen
  - [ ] Sign in screen
  - [ ] AuthContext
- [ ] Bottom tab navigation (Home, Groups, Profile)
- [ ] Placeholder screens

**Directory Structure:**
```
mobile/
  src/
    screens/
      Auth/
      Onboarding/
      Home/
      Groups/
      Profile/
    components/
    contexts/
      AuthContext.tsx
    lib/
      supabase.ts
    navigation/
```

---

### 🔄 Week 8: Core Screens

#### To Do:
- [ ] Onboarding Flow (5-7 screens)
  - [ ] Interest selection
  - [ ] Group size preference
  - [ ] Personality questions
  - [ ] Location permission
  - [ ] Privacy settings

- [ ] Profile Screen
  - [ ] View profile
  - [ ] Edit mode (name, bio, photo)
  - [ ] Interest management
  - [ ] Privacy settings

- [ ] Group Browsing
  - [ ] List view (nearby groups)
  - [ ] Map view (react-native-maps)
  - [ ] Filters (type, distance, tags)
  - [ ] Group cards (distance, members, match reasons)

---

## Phase 4: Matching & Safety (Weeks 9-10)

### 🔄 Week 9: Matching UI

#### To Do:
- [ ] Matching Feed
  - [ ] "Discover People" screen
  - [ ] Person cards (photo, interests, distance, score)
  - [ ] "Why this match?" component
  - [ ] Connect button (placeholder for Phase 2)

- [ ] Group Detail & Join
  - [ ] Group detail screen
  - [ ] Member list
  - [ ] "Request to Join" button
  - [ ] Pending/approved status
  - [ ] Leave group button

- [ ] Leader Features
  - [ ] "My Groups" tab
  - [ ] Pending join requests
  - [ ] Approve/reject buttons
  - [ ] Member management

---

### 🔄 Week 10: Safety & Launch

#### To Do:
- [ ] Push Notifications
  - [ ] Setup Expo Push
  - [ ] Request permissions
  - [ ] Store push tokens
  - [ ] Send notifications (join approved, new matches, welcome)

- [ ] Safety Features
  - [ ] Block person (POST /api/persons/:id/block)
  - [ ] Report person/group (POST /api/reports)
  - [ ] Confirmation dialogs

- [ ] Polish
  - [ ] Loading states
  - [ ] Error handling (toast messages)
  - [ ] Empty states
  - [ ] Image optimization
  - [ ] App icon + splash screen

- [ ] Testing & Launch
  - [ ] Build APK/IPA
  - [ ] Beta testing (10-20 users)
  - [ ] Fix critical bugs
  - [ ] App Store + Play Store submission

---

## Current Priority (Next Steps)

### Immediate (Once DB is migrated):

1. **Complete database setup:**
   ```bash
   # After updating .env with credentials:
   npx prisma migrate dev --name init
   # Run setup-postgis.sql in Supabase SQL Editor
   ```

2. **Implement Person API (Task #3):**
   - Start with GET /api/persons/me
   - Then POST /api/auth/signup
   - Then PATCH /api/persons/me

3. **Create Interest seed data (Task #4):**
   - prisma/seed.ts with 50-100 interests
   - Categories: hobbies, sports, spiritual, professional, social

4. **Test proximity search (Task #6):**
   - Create sample Person records with different locations
   - Test PostGIS queries
   - Verify distance calculations

---

## Key Files Reference

### Core Infrastructure
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `src/lib/prisma.ts` - Prisma client singleton
- ✅ `src/lib/supabase/server.ts` - Supabase server client
- ✅ `src/lib/supabase/client.ts` - Supabase browser client

### Configuration
- ✅ `.env` - Environment variables (needs DB credentials)
- ✅ `.env.example` - Template for .env
- ⏳ `src/config/onboarding.ts` - Onboarding questions (to create)

### Services (To Create)
- ⏳ `src/lib/services/personService.ts`
- ⏳ `src/lib/services/onboardingService.ts`
- ⏳ `src/lib/services/proximityService.ts`
- ⏳ `src/lib/services/groupService.ts`
- ⏳ `src/lib/services/groupDiscoveryService.ts`
- ⏳ `src/lib/services/privacyService.ts`
- ⏳ `src/lib/services/safetyService.ts`

### Matching Engine (To Create)
- ⏳ `src/lib/matching/compatibilityEngine.ts`

### API Routes (Some Exist, Need Implementation)
- ✅ `src/app/api/health/route.ts` - Health check
- ⏳ `src/app/api/auth/signup/route.ts` - Needs implementation
- ⏳ `src/app/api/persons/me/route.ts` - Needs implementation
- ⏳ Many more to create...

---

## Tech Stack Reminder

- **Backend:** Next.js 14+ (App Router, API Routes)
- **Runtime:** Node.js 20 LTS (Vercel serverless functions)
- **Database:** PostgreSQL 15 (Supabase) + PostGIS + pgvector
- **Auth:** Supabase Auth (JWT + OAuth)
- **Cache:** Upstash Redis (serverless)
- **Deployment:** Vercel (free tier, auto-scaling)
- **Mobile:** React Native 0.74+ with Expo SDK 51+

---

## Free Tier Limits

| Service | Free Tier | Status |
|---------|-----------|--------|
| Vercel | 100GB bandwidth, unlimited functions | ✅ Pending deployment |
| Supabase | 500MB DB, 1GB storage, 2GB bandwidth | ✅ Project created |
| Upstash Redis | 10k commands/day | ✅ Pending setup |
| Expo Push | Unlimited | ⏳ Phase 4 |
| Resend | 100 emails/day | ⏳ Phase 4 |

**Total Cost:** $0/month for MVP (targeting 100-500 users)

---

## Success Criteria for MVP

- [ ] 70%+ onboarding completion rate
- [ ] < 3 minutes onboarding time
- [ ] 50%+ users join at least one group
- [ ] 30%+ users connect with at least one person
- [ ] < 500ms API p95 response time
- [ ] 99.5%+ uptime
- [ ] Zero security incidents

---

**Last Updated:** 2026-02-13
**Current Phase:** Week 1 - Database Migration
**Next Milestone:** Person API Implementation
