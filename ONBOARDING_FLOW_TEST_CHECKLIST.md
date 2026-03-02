# 4-Phase Onboarding Flow - Testing Checklist

## Test URL
**Base**: http://localhost:3000

**Start Point**: http://localhost:3000/onboarding/review

---

## ✅ Phase 1: VERIFY (Step 17)

**Page**: `/onboarding/review`

### Visual Checks
- [ ] Step counter shows "17 / 20"
- [ ] Title: "Review Your Spiritual Resume"
- [ ] Description mentions "Phase 1: Verify Your Input"
- [ ] Blue gradient header with "Phase 1: Verify Your Input"
- [ ] All 15 sections display in grid layout
- [ ] DNA Discovery section shows "Ready for analysis"
- [ ] Gold anchors display correctly in cards
- [ ] Edit buttons appear on all cards
- [ ] "What's Next?" preview shows 3 upcoming phases
- [ ] Purple-themed preview section

### Functional Checks
- [ ] Back button navigates to `/onboarding/boundaries`
- [ ] Next button text: "Continue to DNA Reveal"
- [ ] Next button is enabled (not disabled)
- [ ] Clicking Next navigates to `/onboarding/dna-reveal`
- [ ] Edit buttons navigate to correct pages with `?from=review` query param

### Data Verification
- [ ] All stored data displays correctly
- [ ] Private sections show lock icon and "Visible only to you"
- [ ] Interest labels display properly (not UUIDs)
- [ ] No "undefined" or error text visible

---

## ✅ Phase 2: REVEAL (Step 18)

**Page**: `/onboarding/dna-reveal`

### Visual Checks
- [ ] Step counter shows "18 / 20"
- [ ] Title: "The DNA Reveal"
- [ ] Description mentions "Phase 2: The Reveal"
- [ ] Purple gradient hero section with sparkles
- [ ] "Phase 2: The Reveal" heading
- [ ] "The Mirror Moment" subtitle
- [ ] DNA Reveal Card displays
- [ ] 6-dimensional radar chart renders correctly
- [ ] Archetype badge shows (e.g., "THE DILIGENT STEWARD")
- [ ] All 6 HEXACO dimensions labeled (H, E, X, A, C, O)
- [ ] Radar chart uses purple gradient colors
- [ ] Compact legend shows all scores
- [ ] "What's Next?" section in emerald theme

### Functional Checks
- [ ] Back button navigates to `/onboarding/review`
- [ ] Next button text: "Continue to Commitment"
- [ ] Next button enabled after HEXACO scores load
- [ ] Clicking Next navigates to `/onboarding/code-of-conduct`
- [ ] No console errors during chart rendering

### Data Verification
- [ ] HEXACO scores calculated correctly (0-5 range)
- [ ] Archetype determined from scores
- [ ] Chart data matches score values
- [ ] Loading state shows briefly before reveal
- [ ] "Analyzing Your DNA..." shows if scores not ready

---

## ✅ Phase 3: COMMIT (Step 19)

**Page**: `/onboarding/code-of-conduct`

### Visual Checks
- [ ] Step counter shows "19 / 20"
- [ ] Title: "Code of Conduct"
- [ ] Emerald gradient hero section
- [ ] "Phase 3: The Commitment" heading
- [ ] "How We Live Together" subtitle
- [ ] Four conduct cards display:
  - [ ] Love & Respect (Rose theme)
  - [ ] Integrity & Honesty (Blue theme)
  - [ ] Community & Accountability (Emerald theme)
  - [ ] Safety & Boundaries (Amber theme)
- [ ] Additional Community Standards section
- [ ] Violations & Accountability section (red theme)
- [ ] Two confirmation checkboxes
- [ ] Preview section appears when both boxes checked

### Functional Checks
- [ ] Back button navigates to `/onboarding/dna-reveal`
- [ ] First checkbox: "I have read and understand"
- [ ] Second checkbox disabled until first is checked
- [ ] Second checkbox enables after first is checked
- [ ] Next button text: "Accept & Continue"
- [ ] Next button disabled until both checkboxes checked
- [ ] Next button enabled when both checkboxes checked
- [ ] Clicking Next navigates to `/onboarding/covenant`
- [ ] Preview section animates in when agreed

### Behavior Verification
- [ ] Cannot check second box before first
- [ ] Cannot proceed without checking both boxes
- [ ] Checkboxes maintain state on back/forward navigation

---

## ✅ Phase 4: SEAL (Step 20)

**Page**: `/onboarding/covenant`

### Visual Checks
- [ ] Step counter shows "20 / 20"
- [ ] Title: "The Brotherhood Covenant"
- [ ] Description mentions "Phase 4: The Seal"
- [ ] Four covenant sections display:
  - [ ] Respect & Safety (Blue border)
  - [ ] Authenticity & Vulnerability (Purple border)
  - [ ] Accountability & Growth (Emerald border)
  - [ ] Christ-Centered Fellowship (Amber border)
- [ ] Sidebar layout with icons and principles
- [ ] Agreement section in indigo theme
- [ ] Large toggle button for agreement
- [ ] Signature section shows when agreed
- [ ] Current date displays in signature (e.g., "March 1, 2026")

### Functional Checks
- [ ] Back button navigates to `/onboarding/code-of-conduct`
- [ ] Agreement toggle works (click to agree/disagree)
- [ ] Signature section appears when agreed
- [ ] Next button text: "Seal Covenant & Join"
- [ ] Next button disabled when not agreed
- [ ] Next button enabled when agreed
- [ ] Next button shows "Sealing Covenant..." during submission
- [ ] Clicking Next submits to `/api/onboarding/complete`
- [ ] Error message displays if submission fails
- [ ] Successful submission redirects to `/` (Dashboard)
- [ ] Store is reset after successful submission

### Submission Verification
- [ ] All onboarding data sent to API
- [ ] HEXACO responses formatted correctly
- [ ] All arrays formatted correctly (interests, gifts, etc.)
- [ ] Privacy settings preserved
- [ ] Custom values included
- [ ] API returns success response
- [ ] User redirected to dashboard
- [ ] Onboarding store cleared

---

## 🔄 Complete Flow Test

### End-to-End Journey
1. [ ] Start at `/onboarding/review` (step 17)
2. [ ] Review all data, click "Continue to DNA Reveal"
3. [ ] View DNA Radar Chart, click "Continue to Commitment"
4. [ ] Read code of conduct, check both boxes, click "Accept & Continue"
5. [ ] Read covenant, click agreement toggle, click "Seal Covenant & Join"
6. [ ] Verify submission successful
7. [ ] Verify redirected to dashboard
8. [ ] Verify onboarding complete in database

### Back Navigation Test
1. [ ] Start at step 20 (Covenant)
2. [ ] Click Back → should go to step 19 (Code of Conduct)
3. [ ] Click Back → should go to step 18 (DNA Reveal)
4. [ ] Click Back → should go to step 17 (Review)
5. [ ] Click Back → should go to step 16 (Boundaries)

### Data Persistence Test
1. [ ] Navigate forward through flow
2. [ ] Use back button to return to previous steps
3. [ ] Verify agreement checkboxes remember state
4. [ ] Verify covenant agreement remembers state
5. [ ] Navigate forward again
6. [ ] Verify all state preserved

---

## 🐛 Known Issues / Edge Cases

### Expected Behaviors
- [ ] 401 errors on `/api/onboarding/complete` when not authenticated (expected)
- [ ] HEXACO scores must be complete (60 responses) for DNA reveal
- [ ] Archetype calculation requires valid HEXACO scores
- [ ] Code of conduct requires sequential checkbox agreement

### Error Scenarios to Test
- [ ] What happens if HEXACO scores incomplete?
- [ ] What happens if API submission fails?
- [ ] What happens if user not authenticated?
- [ ] What happens if network error during submission?

---

## 📊 Performance Checks

### Page Load Times
- [ ] Review page loads < 1s
- [ ] DNA Reveal page loads < 1s
- [ ] Code of Conduct page loads < 500ms
- [ ] Covenant page loads < 500ms

### Chart Rendering
- [ ] Radar chart renders within 500ms
- [ ] No visual glitches or flashing
- [ ] Smooth animation on reveal

### API Performance
- [ ] Submission completes < 2s
- [ ] HEXACO insights generated during onboarding
- [ ] No unnecessary re-fetches

---

## 📱 Mobile Responsiveness

### Layout Checks
- [ ] Review page grid collapses on mobile
- [ ] DNA Reveal card stacks properly
- [ ] Code of Conduct cards stack properly
- [ ] Covenant sidebar layout works on mobile
- [ ] All text readable on small screens
- [ ] Buttons accessible and tappable

---

## 🎨 Visual Polish

### Typography
- [ ] All headings use correct font weights
- [ ] Body text is readable (leading-relaxed)
- [ ] No text overflow or truncation
- [ ] Proper spacing between sections

### Colors
- [ ] Blue theme consistent in Phase 1
- [ ] Purple theme consistent in Phase 2
- [ ] Emerald theme consistent in Phase 3
- [ ] Indigo/purple theme consistent in Phase 4
- [ ] Icons use correct colors
- [ ] Borders use correct colors

### Animations
- [ ] Smooth transitions between states
- [ ] No janky animations
- [ ] Loading states show appropriately
- [ ] Fade-in effects work smoothly

---

## ✅ Success Criteria

### Must Pass
- ✅ All 4 phases display correctly
- ✅ Navigation flows forward and backward correctly
- ✅ DNA Radar Chart renders with correct data
- ✅ Code of Conduct requires both checkboxes
- ✅ Covenant submission works and redirects
- ✅ No console errors or warnings
- ✅ Data persists through navigation

### Nice to Have
- ⭐ Smooth animations throughout
- ⭐ Fast page loads (< 1s)
- ⭐ Beautiful visual design matches mockups
- ⭐ Mobile responsive on all devices

---

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] No console errors in dev tools
- [ ] Database migrations applied
- [ ] Environment variables set correctly
- [ ] Gemini API key configured
- [ ] Error handling tested
- [ ] Success path tested
- [ ] Edge cases handled

---

**Test Date**: March 1, 2026

**Tester**: _________________

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Notes**:
