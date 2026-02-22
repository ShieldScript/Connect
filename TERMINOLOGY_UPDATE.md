# Terminology Update - From Military to Christian Fellowship

## Changes Made

### Navigation & Menu (✅ COMPLETED)

**CollapsibleSidebar.tsx**:
- ❌ "The Forge" → ✅ "My Profile"
- ❌ "STATIONED" → ✅ "Your Community"
- ❌ "MISSION: {city}" → ✅ "{city}, {region}"
- ❌ "COORDINATES" → ✅ Removed (too military)
- ❌ "MODE" → ✅ "Fellowship Style"
- ❌ All caps military style → ✅ Friendly sentence case

**Onboarding Page** (✅ COMPLETED):
- ❌ "stationed" → ✅ "located"
- ❌ "Your Station" → ✅ "Your Location"
- ❌ "Station Card" → ✅ "Location Card"
- ❌ "Identity & Station" → ✅ "Identity & Location"
- ❌ "Confirm your station" → ✅ "Confirm your location"

---

## Remaining Updates Needed

### Connection Styles (High Priority)

Current names (too military/workshop-focused):
1. ❌ **"The Workshop"** → ✅ Suggested: **"Hands-On Fellowship"** or **"Building Together"**
2. ✅ **"The Fireside"** → Keep (warm, fellowship-oriented)
3. ❌ **"The Outpost"** → ✅ Suggested: **"Online Circle"** or **"Digital Fellowship"**

Files to update:
- `src/app/onboarding/page.tsx` (lines 903-964)
- `prisma/seed.ts`
- All components displaying connection styles

### Group/Circle Terminology

Current usage is inconsistent:
- Some places say "groups"
- Some places say "gatherings"
- Some places say "circles"

**Recommended**: Standardize on **"Circles"** (modern church language for small groups)

Files to update:
- Navigation labels
- Page titles
- Button text
- API route names (optional, for consistency)

### Page Titles & Headers

Files that may need updates:
1. **Dashboard** - Check for military language
2. **Discovery/Groups Page** - Check for "mission" language
3. **Profile Page** - Formerly "The Forge", needs renaming
4. **Group Management** - "Mission Control" should be "Circle Hub" or "Circle Details"

### Military Phrases to Find & Replace

Search for these across all files:
- "mission" / "Mission" → "purpose" / "community"
- "tactical" / "Tactical" → "practical" / "organized"
- "deploy" / "Deploy" → "join" / "participate"
- "status" / "Status" → "info" / "details"
- "briefing" / "Briefing" → "overview" / "introduction"
- "operational" / "Operational" → "fellowship" / "connection"

---

## Christian Fellowship Vocabulary Guide

### DO USE (Christian Fellowship):
- **Circle** (instead of group/gathering)
- **Brotherhood** (male fellowship)
- **Fellowship** (togetherness)
- **Community** (shared location/purpose)
- **Connection** (relationships)
- **Located** (where someone is)
- **Journey** (spiritual growth)
- **Calling** (purpose)
- **Serve** / **Service** (helping others)

### DON'T USE (Military/Tactical):
- ~~Mission~~ → Purpose
- ~~Station~~ / ~~Stationed~~ → Located / Community
- ~~Coordinates~~ → (just show city/region)
- ~~Deploy~~ → Join
- ~~Tactical~~ → Practical
- ~~Operational~~ → Fellowship
- ~~Status~~ → Info
- ~~Briefing~~ → Overview
- ~~Command~~ / ~~Control~~ → Hub / Center

---

## Implementation Checklist

### Phase 1: Navigation & Core UI (✅ COMPLETED)
- ✅ Sidebar menu items
- ✅ Sidebar status bar
- ✅ Onboarding page

### Phase 2: Connection Styles (TODO)
- [ ] Rename "The Workshop" → "Hands-On Fellowship"
- [ ] Rename "The Outpost" → "Online Circle"
- [ ] Update onboarding page
- [ ] Update seed data
- [ ] Update all display components

### Phase 3: Page Headers & Titles (TODO)
- [ ] Dashboard page
- [ ] Discovery page
- [ ] Profile page (formerly "The Forge")
- [ ] Group management pages

### Phase 4: Components & Forms (TODO)
- [ ] DiscoveryHeader
- [ ] DiscoveryClient
- [ ] DashboardClient
- [ ] ManageGatheringForm
- [ ] CreateGatheringForm
- [ ] Profile components

### Phase 5: Documentation & Comments (TODO)
- [ ] Update code comments
- [ ] Update README terminology
- [ ] Update API documentation

---

## User Feedback Incorporated

> "This is a Christian app that connects Christian men together. The Forge in the side pane, the Mission Control in the Forge details page are too military like. We want it to be more Christian like (modern church). Like Circle, Brothers and etc"

Changes made based on this feedback:
1. ✅ "The Forge" → "My Profile" (sidebar)
2. ✅ Removed military status bar language
3. ✅ Updated onboarding terminology
4. 🔄 "Mission Control" → Still need to find and update

---

## Next Steps

1. **Get user approval** on connection style names:
   - "Hands-On Fellowship" for workshop?
   - "Online Circle" for outpost?

2. **Standardize on "Circles"** for groups/gatherings throughout app

3. **Find and update "Mission Control"** reference

4. **Sweep all remaining files** for military language

5. **Update database seed data** with new terminology
