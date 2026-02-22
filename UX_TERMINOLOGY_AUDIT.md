# UX Terminology Audit - All Text Labels

## 🔴 HIGH PRIORITY - User-Facing Text

### Military Language to Update

#### 1. **"Deploy/Deploying to Fellowship"**
**Found in:**
- `src/app/onboarding/page.tsx:474` - "Deploy to Fellowship" (sidebar step)
- `src/app/onboarding/page.tsx:1317` - "Deployment CTA" (comment)
- `src/app/onboarding/page.tsx:1328` - "Deploying to Fellowship..." (loading)
- `src/app/onboarding/page.tsx:1331` - "Deploy to Fellowship" (button)
- `src/components/CreateGatheringForm.tsx:38` - "re-deploy data" (comment)

**Suggested replacement:** "Join the Fellowship" / "Joining..."

---

#### 2. **"Commission/Commissioning"**
**Found in:**
- `src/app/onboarding/page.tsx:1153` - "Review Your Commission"
- `src/components/CommissioningScreen.tsx:5` - Component name
- `src/components/CommissioningScreen.tsx:23` - "Commissioning your profile, brother..."
- `src/app/globals.css:44` - "Commissioning Screen Loading Bar"

**Suggested replacement:** "Review Your Profile" / "Setting up your profile, brother..."

---

#### 3. **"Tactical"**
**Found in:**
- `src/components/TacticalMap.tsx:9` - Component name
- `src/components/FieldBrief.tsx:112` - "Tactical Summary" (header)
- `src/components/DiscoveryFeed.tsx:237` - "Tactical HUD controls" (comment)
- `src/components/DiscoveryClient.tsx:118` - "Tactical Command Split" (comment)

**Suggested replacement:**
- TacticalMap → RadialCompassMap (already exists!)
- "Summary" or "Overview"
- "Filter controls"
- "Discovery Layout"

---

#### 4. **"Mission" (in archetype descriptions)**
**Found in:**
- `src/app/onboarding/page.tsx:110` - "strategic planning for the mission"
- `src/app/profile/update-skills/page.tsx:55` - Same text

**Suggested replacement:** "strategic planning for the community" or "for the purpose"

---

#### 5. **"Operational security"**
**Found in:**
- `src/app/onboarding/page.tsx:104` - "operational security of the fellowship"
- `src/app/profile/update-skills/page.tsx:49` - Same text

**Suggested replacement:** "safety and protection of the fellowship"

---

### Workshop/Outpost Connection Styles

#### 6. **"The Workshop"** (appears 10+ times)
**Found in:**
- `src/app/onboarding/page.tsx:913` - Title
- `src/app/onboarding/page.tsx:1297` - Display text
- `src/app/profile/update-skills/page.tsx:500` - Title
- `src/components/profile/ConnectionStyleSection.tsx:34` - Label
- `src/app/page.tsx:102,107,108` - Default values
- `src/components/CollapsibleSidebar.tsx:30` - Default
- `src/components/ProfileClient.tsx:23,35` - Default

**Suggested replacement:**
- **Option A:** "Hands-On Fellowship"
- **Option B:** "Building Together"
- **Option C:** "The Builder's Circle"

---

#### 7. **"The Outpost"** (appears 8+ times)
**Found in:**
- `src/app/onboarding/page.tsx:957` - Title
- `src/app/onboarding/page.tsx:1299` - Display text
- `src/app/profile/update-skills/page.tsx:544` - Title
- `src/components/profile/ConnectionStyleSection.tsx:62` - Label
- `src/app/page.tsx:104` - Mapping

**Suggested replacement:**
- **Option A:** "Online Circle"
- **Option B:** "Digital Fellowship"
- **Option C:** "The Connected Circle"

---

### Variable Names (Internal, Lower Priority)

#### 8. **"station" / "Station"** (50+ occurrences)
Variable names and props throughout the app. These are internal but affect maintainability.

**Files with "station" props:**
- `src/components/CollapsibleSidebar.tsx`
- `src/components/DashboardClient.tsx`
- `src/components/FellowsSection.tsx`
- `src/app/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/groups/page.tsx`

**Note:** Already updated user-facing text, but variable names still say "station"

**Suggested:** Keep for now (internal code) OR rename to "community" / "location"

---

#### 9. **"operationalMode"**
Variable name used for connectionStyle selection.

**Found in:**
- `src/app/onboarding/page.tsx:190,191` - Variable declaration
- `src/app/profile/update-skills/page.tsx:127,128` - Variable declaration

**Suggested:** Rename to `connectionMode` or `fellowshipStyle`

---

## 🟡 MEDIUM PRIORITY - Comments & Helpers

### Code Comments
- "Tactical Command Split" → "Discovery Layout"
- "Tactical HUD controls" → "Filter controls"
- "Tactical Summary" → "Overview"
- "re-deploy data" → "pre-fill data"
- "digital stations" → "virtual circles"

---

## 🟢 LOW PRIORITY - Component Names

### Component Files to Consider Renaming:
1. `TacticalMap.tsx` → Already have `RadialCompassMap.tsx` (use that instead!)
2. `CommissioningScreen.tsx` → `SetupScreen.tsx` or `WelcomeScreen.tsx`
3. `FieldBrief.tsx` → `CircleOverview.tsx` or `GatheringDetails.tsx`

---

## Recommended Action Plan

### Phase 1: Critical User-Facing Text (Do First)
1. ✅ "Deploy" → "Join the Fellowship"
2. ✅ "Commission" → "Profile" / "Setup"
3. ✅ "The Workshop" → **[USER CHOICE NEEDED]**
4. ✅ "The Outpost" → **[USER CHOICE NEEDED]**

### Phase 2: Headers & Labels
5. ✅ "Tactical Summary" → "Overview"
6. ✅ "operational security" → "safety and protection"
7. ✅ "mission" → "purpose" / "community"

### Phase 3: Variables & Code (Optional)
8. ⚠️ "station" → "community" / "location" (internal code)
9. ⚠️ "operationalMode" → "connectionMode"

---

## Questions for User

**Before I make these changes, please confirm:**

1. **Connection Style Names:**
   - "The Workshop" → What should this be?
     - A) "Hands-On Fellowship"
     - B) "Building Together"
     - C) Other: ___________

   - "The Outpost" → What should this be?
     - A) "Online Circle"
     - B) "Digital Fellowship"
     - C) Other: ___________

2. **Should I update internal variable names** (station, operationalMode) or just user-facing text?

3. **Any other terminology concerns** from this audit?

---

## Files Summary

**Total files with terminology issues:** 24 files

**Most affected files:**
1. `src/app/onboarding/page.tsx` - 30+ instances
2. `src/app/profile/update-skills/page.tsx` - 15+ instances
3. `src/components/profile/ConnectionStyleSection.tsx` - 6 instances
4. `src/app/page.tsx` - 8 instances
5. `src/components/CollapsibleSidebar.tsx` - 4 instances
