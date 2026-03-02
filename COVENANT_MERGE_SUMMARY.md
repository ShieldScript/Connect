# Covenant & Code of Conduct Merge - Summary

**Date**: March 1, 2026

---

## What Changed

We merged the **Code of Conduct** page into the **Covenant** page, reducing the onboarding from **20 steps to 19 steps**.

## Why?

Having TWO commitment pages at the end of onboarding was:
- ❌ Redundant (both covered behavioral expectations)
- ❌ Exhausting (too much to read at the end of a long journey)
- ❌ Confusing (unclear distinction between "Code of Conduct" and "Covenant")

## Solution: Option 1 (Implemented)

✅ **Keep Only Covenant** with added Community Guidelines section
- Covenant remains aspirational and Christ-centered
- Community Guidelines added as a brief section covering practical rules
- Single agreement checkbox
- Still submits all onboarding data

## New Structure

### Old Flow (20 Steps)
```
Step 17: Review
Step 18: DNA Reveal
Step 19: Code of Conduct ← REMOVED
Step 20: Covenant ← NOW STEP 19
```

### New Flow (19 Steps)
```
Step 17: Review
Step 18: DNA Reveal
Step 19: Covenant (with Community Guidelines)
```

---

## Files Modified

### 1. **Covenant Page** (`/app/onboarding/covenant/page.tsx`)
- ✅ Added "Community Guidelines" section with 6 practical rules
- ✅ Changed from step 20 to step 19
- ✅ Updated totalSteps from 20 to 19
- ✅ Back button now goes to DNA Reveal instead of Code of Conduct
- ✅ Updated description (removed "Phase 4: The Seal")

### 2. **DNA Reveal Page** (`/app/onboarding/dna-reveal/page.tsx`)
- ✅ Next button now routes to `/covenant` instead of `/code-of-conduct`
- ✅ Updated totalSteps from 20 to 19
- ✅ Button text changed from "Continue to Commitment" to "Continue to Covenant"

### 3. **Review Page** (`/app/onboarding/review/page.tsx`)
- ✅ Updated totalSteps from 20 to 19

### 4. **Sidebar** (`/components/onboarding/OnboardingSidebar.tsx`)
- ✅ Changed "THE 4 PHASES" to "COMMITMENT"
- ✅ Updated steps from [17, 18, 19, 20] to [17, 18, 19]
- ✅ Updated description from "Verify, Reveal, Commit, Seal" to "Review, Reveal, Covenant"
- ✅ Removed step 19 "Code of Conduct" label
- ✅ Kept step 19 as "Covenant"

### 5. **OnboardingStep Component** (`/components/onboarding/OnboardingStep.tsx`)
- ✅ Updated getChapterInfo logic:
  - Step 17: "REVIEW" (step 1 of 3)
  - Step 18: "REVEAL" (step 2 of 3)
  - Step 19: "COVENANT" (step 3 of 3)

### 6. **Welcome Page** (`/app/onboarding/welcome/page.tsx`)
- ✅ Changed "5 stages and 4 transformative phases" to "5 stages and 3 commitment steps"
- ✅ Changed "The 4 Phases" pillar label to "Commitment"

### 7. **All Onboarding Pages** (Batch Update)
- ✅ Updated totalSteps from 20 to 19 in 14 pages:
  - interests, natural-giftings, supernatural-giftings, ministry-experience
  - milestones, growth-areas, leadership-patterns, life-stages
  - callings, healing-themes, practices, boundaries, hexaco-60

### 8. **Deleted**
- ❌ `/app/onboarding/code-of-conduct/` directory and page.tsx

---

## Community Guidelines Added to Covenant

The Covenant page now includes these practical guidelines:

1. **No solicitation** - No selling, recruiting, or self-promotion
2. **Theological humility** - Major on majors, grace on secondary issues
3. **Confidentiality** - What's shared stays shared (unless safety is at risk)
4. **Conflict resolution** - Follow Matthew 18 principles
5. **Online etiquette** - Assume the best, communicate clearly
6. **Violations** - Restoration-focused approach with warnings/suspension if needed

---

## Verification Checklist

- [x] Covenant page includes Community Guidelines section
- [x] All routing updated (DNA Reveal → Covenant)
- [x] All step numbers updated (19 instead of 20)
- [x] Sidebar reflects 19 steps
- [x] Welcome page updated
- [x] Code of Conduct page deleted
- [x] All pages show totalSteps={19}
- [x] OnboardingStep getChapterInfo logic updated

---

## User Experience Improvements

✅ **Shorter onboarding** - One less page to read and agree to
✅ **Clearer purpose** - Covenant focuses on spiritual commitment with practical guidelines
✅ **Less redundancy** - No more overlap between Code of Conduct and Covenant
✅ **Better flow** - DNA Reveal → Covenant feels natural

---

## Testing

To test the full flow:
1. Reset onboarding: `localStorage.removeItem('onboarding-storage'); location.reload();`
2. Complete all 19 steps
3. Verify step 19 shows Covenant with Community Guidelines
4. Verify sidebar shows 3 steps in COMMITMENT chapter (17, 18, 19)
5. Verify totalSteps progress shows 19 as 100%

---

**Status**: ✅ **COMPLETE**

**Last Updated**: March 1, 2026
