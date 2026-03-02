# Brotherhood Connect - Onboarding Testing Guide

## Overview

This guide covers testing the new 17-step onboarding flow with 11 spiritual resume layers.

---

## Prerequisites

1. **Database Setup**
   - PostgreSQL with PostGIS extension enabled
   - Database migrated with new schema
   - Seed data loaded (8 categories, 134 activities)

2. **Environment Variables**
   ```bash
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Dependencies Installed**
   ```bash
   npm install
   ```

---

## Testing Checklist

### Phase 1: Database Verification

```bash
# Check database connection
npm run db:check

# View database in Prisma Studio
npm run db:studio
```

**Verify:**
- [ ] 8 InterestCategory records exist
- [ ] 134 Activity records exist
- [ ] All 11 spiritual layer tables are created
- [ ] All enums are properly defined

---

### Phase 2: Build Verification

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Build the app
npm run build
```

**Expected:** No TypeScript errors, successful build

---

### Phase 3: Local Development Testing

```bash
# Start dev server
npm run dev
```

Navigate to: `http://localhost:3000/onboarding`

---

### Phase 4: Step-by-Step Flow Testing

#### Step 1: Welcome
- **Route:** `/onboarding/welcome`
- **Test:**
  - [ ] Hero section displays correctly
  - [ ] Mission statement is readable
  - [ ] 4 feature cards display
  - [ ] "What to Expect" section shows 17 steps
  - [ ] "Begin Journey" button navigates to identity page

#### Step 2: Identity
- **Route:** `/onboarding/identity`
- **Test:**
  - [ ] Display name input works
  - [ ] Bio textarea works (max 500 chars)
  - [ ] Live preview shows entered data
  - [ ] "Continue" button disabled if name empty
  - [ ] "Back" button returns to welcome
  - [ ] Progress bar shows 2/17

#### Step 3: Location
- **Route:** `/onboarding/location`
- **Test:**
  - [ ] Community input (optional)
  - [ ] City input (required)
  - [ ] Region input (required)
  - [ ] "Get Coordinates" button appears when city+region filled
  - [ ] Geocoding works (uses Nominatim API)
  - [ ] Coordinates display after geocoding
  - [ ] "Continue" disabled if city or region empty
  - [ ] Privacy notice displays

#### Step 4: Interests & Activities
- **Route:** `/onboarding/interests`
- **Test:**
  - [ ] All 8 categories load
  - [ ] Categories are expandable (accordion)
  - [ ] Activity chips are clickable
  - [ ] Selected chips turn blue
  - [ ] Clicking again opens proficiency/privacy settings
  - [ ] 1-5 slider works smoothly
  - [ ] Privacy toggle (PUBLIC/GROUP/PRIVATE) works
  - [ ] Selection count displays (must select ≥3)
  - [ ] "Continue" disabled until 3+ selected
  - [ ] Max 20 activities enforced

**Categories to test:**
1. Outdoor & Adventure (29 activities)
2. Craftsmanship, Trades & Maker (20 activities)
3. Physicality, Combat & Team Sports (17 activities)
4. Culinary, Fire & Food Systems (12 activities)
5. Strategy, Mentorship & Leadership (12 activities)
6. Faith, Formation & Relational Care (17 activities)
7. Service, Civic & Community Action (12 activities)
8. Creative & Cultural (15 activities)

#### Steps 5-15: Spiritual Layers

**All layers share similar UI via `LayerStep` component. Test one thoroughly, then spot-check others.**

##### Step 5: Natural Giftings
- **Route:** `/onboarding/natural-giftings`
- **Test:**
  - [ ] 16 enum options load
  - [ ] "CUSTOM" option allows text input
  - [ ] Multi-select chips work
  - [ ] Clicking chip again shows proficiency slider + privacy
  - [ ] Slider labels: Rarely → Core Strength
  - [ ] Default privacy: PUBLIC
  - [ ] "Skip" button works
  - [ ] Max 8 selections enforced

##### Step 6: Supernatural Giftings
- **Route:** `/onboarding/supernatural-giftings`
- **Test:**
  - [ ] 18 options load
  - [ ] Slider labels: Not Experienced → Core Gift
  - [ ] Default privacy: GROUP (medium sensitivity)

##### Step 7: Ministry Experience
- **Route:** `/onboarding/ministry-experience`
- **Test:**
  - [ ] 17 options load
  - [ ] Slider labels: No Experience → Leadership Role

##### Step 8: Spiritual Milestones
- **Route:** `/onboarding/milestones`
- **Test:**
  - [ ] 13 options load
  - [ ] Slider labels: Rarely Reflect → Deeply Integrated
  - [ ] Default privacy: PRIVATE (medium-high sensitivity)

##### Step 9: Areas of Growth & Need
- **Route:** `/onboarding/growth-areas`
- **Test:**
  - [ ] HIGH sensitivity warning displays (amber)
  - [ ] 11 options load
  - [ ] Slider labels: Not a Focus → Significant Growth
  - [ ] Default privacy: PRIVATE

##### Step 10: Leadership Patterns
- **Route:** `/onboarding/leadership-patterns`
- **Test:**
  - [ ] 12 options load (includes "Abusive" for self-awareness)
  - [ ] Slider labels: Never → Very Often

##### Step 11: Life Stage Themes
- **Route:** `/onboarding/life-stages`
- **Test:**
  - [ ] 12 options load
  - [ ] Slider labels: Just Entering → Transitioning Out

##### Step 12: Calling Trajectories
- **Route:** `/onboarding/callings`
- **Test:**
  - [ ] 11 options load
  - [ ] Slider labels: Unclear → Fully Aligned
  - [ ] Default privacy: PUBLIC (low sensitivity)

##### Step 13: Wounds & Healing Themes
- **Route:** `/onboarding/healing-themes`
- **Test:**
  - [ ] **HIGHEST sensitivity warning** displays (red border, ShieldAlert icon)
  - [ ] Warning emphasizes "100% optional" and "private by default"
  - [ ] 11 options load
  - [ ] Slider labels: Not Addressed → Significant Healing
  - [ ] Default privacy: PRIVATE

##### Step 14: Rhythms & Practices
- **Route:** `/onboarding/practices`
- **Test:**
  - [ ] 13 options load
  - [ ] Slider labels: Rarely → Daily/Integrated

##### Step 15: Boundaries & Availability
- **Route:** `/onboarding/boundaries`
- **Test:**
  - [ ] 13 options load
  - [ ] Privacy note explains importance
  - [ ] Slider labels: Rarely Available → Fully Available
  - [ ] Default privacy: PRIVATE

#### Step 16: Covenant
- **Route:** `/onboarding/covenant`
- **Test:**
  - [ ] 4 principle cards display (Respect, Authenticity, Accountability, Christ-Centered)
  - [ ] Icons display correctly
  - [ ] Checkbox toggles agreement
  - [ ] "Continue" disabled until checkbox checked
  - [ ] Agreement text is readable

#### Step 17: Review & Submit
- **Route:** `/onboarding/review`
- **Test:**
  - [ ] Summary cards display all entered data
  - [ ] Edit links work (navigate to correct step)
  - [ ] Badge shows completed steps count
  - [ ] "Complete Onboarding" button is enabled
  - [ ] Clicking submit shows loading state
  - [ ] Success: redirects to dashboard
  - [ ] Error: displays error message

---

### Phase 5: Data Persistence Testing

#### LocalStorage (Zustand Persistence)
1. **Enter data up to Step 10**
2. **Close browser tab**
3. **Reopen `/onboarding`**
4. **Verify:**
   - [ ] Data from Steps 1-9 is preserved
   - [ ] currentStep is correct (should be 10)
   - [ ] All selections are intact

#### Database Submission
1. **Complete full onboarding flow**
2. **Check Prisma Studio:**
   - [ ] Person record created with correct data
   - [ ] PersonActivity records created
   - [ ] PersonNaturalGifting records created (if selected)
   - [ ] All 11 layer tables populated correctly
   - [ ] Privacy levels saved correctly
   - [ ] Location geography field populated (if coordinates entered)
   - [ ] onboardingComplete = true
   - [ ] onboardingStep = 17

---

### Phase 6: Mobile Responsiveness

Test on viewports:
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12/13)
- [ ] 768px (iPad)
- [ ] 1024px (Desktop)

**Key elements to check:**
- Progress bar readable
- Buttons not cut off
- Text wraps properly
- Accordions work on mobile
- Sliders are touch-friendly

---

### Phase 7: Accessibility

- [ ] Keyboard navigation works (Tab through form)
- [ ] Enter key submits where appropriate
- [ ] Focus states visible
- [ ] Screen reader can read step titles
- [ ] Form labels are associated correctly
- [ ] Error messages are announced

---

### Phase 8: Edge Cases

#### Empty State
- [ ] Skipping all optional layers (5-15) works
- [ ] Submission succeeds with only required fields

#### Maximum Selections
- [ ] Selecting 20 activities disables other chips
- [ ] Deselecting allows new selections

#### Browser Back Button
- [ ] Using browser back from Step 5 → 4 works
- [ ] Data is preserved when going back

#### Network Errors
- [ ] API failure shows error message
- [ ] User can retry submission
- [ ] Data not lost on error

#### Invalid Data
- [ ] Empty name prevents submission
- [ ] Empty city/region prevents proceeding

---

## Performance Benchmarks

**Expected Load Times:**
- Step 1 (Welcome): < 200ms
- Step 4 (Interests): < 500ms (loading 134 activities)
- Step 17 (Review): < 300ms
- Final Submission: < 2000ms

**Lighthouse Scores (Target):**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90

---

## Known Issues / Future Improvements

### Current Limitations
1. Geocoding uses free Nominatim API (rate limited)
2. No image upload for profile picture
3. No "Save Draft" button (auto-saves to localStorage only)
4. No progress indicator on individual layer steps

### Planned Enhancements
1. Add AI profile summary generation (Task for later)
2. Add "Resume Later" email reminder
3. Add onboarding analytics
4. Add celebratory animation on completion

---

## Troubleshooting

### "Module not found" errors
```bash
npm install
npx prisma generate
```

### Geocoding not working
- Check CORS (Nominatim blocks some domains)
- Fallback: Allow manual lat/lng entry

### Database connection errors
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run db:check

# Re-enable PostGIS
npx tsx scripts/enable-postgis-simple.ts
```

### Zustand state not persisting
- Check browser localStorage (DevTools → Application → Local Storage)
- Key: `brotherhood-connect-onboarding`
- Clear and retry if corrupted

---

## Success Criteria

✅ **Onboarding is complete when:**
1. All 17 steps are accessible
2. User can complete flow in < 15 minutes
3. Data saves correctly to database
4. Mobile experience is smooth
5. No console errors during flow
6. User redirects to dashboard after completion

---

## Testing Commands Summary

```bash
# Database
npm run db:studio
npm run db:seed

# Development
npm run dev

# Type checking
npx tsc --noEmit

# Build
npm run build

# Production
npm start
```

---

**Last Updated:** February 24, 2026
**Version:** 1.0 (Complete Rebuild)
