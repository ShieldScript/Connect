# Onboarding Flow - Verified Routing Map

**Last Verified**: March 1, 2026
**Total Steps**: 20

---

## Complete Flow

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: Welcome                                     │
│ Route: /onboarding/welcome                          │
│ Next → Step 2 (Identity)                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ IDENTITY PILLAR (Steps 2-4)                         │
├─────────────────────────────────────────────────────┤
│ STEP 2: Identity                                    │
│ Route: /onboarding/identity                         │
│ Back → Step 1 (Welcome)                             │
│ Next → Step 3 (Location)                            │
├─────────────────────────────────────────────────────┤
│ STEP 3: Location                                    │
│ Route: /onboarding/location                         │
│ Back → Step 2 (Identity)                            │
│ Next → Step 4 (Interests)                           │
├─────────────────────────────────────────────────────┤
│ STEP 4: Interests                                   │
│ Route: /onboarding/interests                        │
│ Back → Step 3 (Location)                            │
│ Next → Step 5 (Natural Giftings)                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ STEWARDSHIP PILLAR (Steps 5-12)                     │
├─────────────────────────────────────────────────────┤
│ STEP 5: Natural Giftings                            │
│ Route: /onboarding/natural-giftings                 │
│ Back → Step 4 (Interests)                           │
│ Next → Step 6 (Supernatural Giftings)               │
├─────────────────────────────────────────────────────┤
│ STEP 6: Supernatural Giftings                       │
│ Route: /onboarding/supernatural-giftings            │
│ Back → Step 5 (Natural Giftings)                    │
│ Next → Step 7 (Ministry Experience)                 │
├─────────────────────────────────────────────────────┤
│ STEP 7: Ministry Experience                         │
│ Route: /onboarding/ministry-experience              │
│ Back → Step 6 (Supernatural Giftings)               │
│ Next → Step 8 (Milestones)                          │
├─────────────────────────────────────────────────────┤
│ STEP 8: Spiritual Milestones                        │
│ Route: /onboarding/milestones                       │
│ Back → Step 7 (Ministry Experience)                 │
│ Next → Step 9 (Growth Areas)                        │
├─────────────────────────────────────────────────────┤
│ STEP 9: Areas of Growth                             │
│ Route: /onboarding/growth-areas                     │
│ Back → Step 8 (Milestones)                          │
│ Next → Step 10 (Leadership Patterns)                │
├─────────────────────────────────────────────────────┤
│ STEP 10: Leadership Patterns                        │
│ Route: /onboarding/leadership-patterns              │
│ Back → Step 9 (Growth Areas)                        │
│ Next → Step 11 (Life Stages)                        │
├─────────────────────────────────────────────────────┤
│ STEP 11: Life Stages                                │
│ Route: /onboarding/life-stages                      │
│ Back → Step 10 (Leadership Patterns)                │
│ Next → Step 12 (Callings)                           │
├─────────────────────────────────────────────────────┤
│ STEP 12: Calling Trajectories                       │
│ Route: /onboarding/callings                         │
│ Back → Step 11 (Life Stages)                        │
│ Next → Step 13 (Healing Themes)                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ RHYTHMS PILLAR (Steps 13-15)                        │
├─────────────────────────────────────────────────────┤
│ STEP 13: Healing Themes (Private)                   │
│ Route: /onboarding/healing-themes                   │
│ Back → Step 12 (Callings)                           │
│ Next → Step 14 (Practices)                          │
├─────────────────────────────────────────────────────┤
│ STEP 14: Rhythms & Practices                        │
│ Route: /onboarding/practices                        │
│ Back → Step 13 (Healing Themes)                     │
│ Next → Step 15 (Boundaries)                         │
├─────────────────────────────────────────────────────┤
│ STEP 15: Boundaries & Availability (Private)        │
│ Route: /onboarding/boundaries                       │
│ Back → Step 14 (Practices)                          │
│ Next → Step 16 (HEXACO-60)                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ DNA DISCOVERY (Step 16)                             │
├─────────────────────────────────────────────────────┤
│ STEP 16: HEXACO-60 Assessment                       │
│ Route: /onboarding/hexaco-60                        │
│ Back → Step 15 (Boundaries)                         │
│ Next → Step 17 (Review)                             │
│ Note: 60-question personality assessment            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ THE 4 PHASES (Steps 17-20)                          │
├─────────────────────────────────────────────────────┤
│ STEP 17: Review - VERIFY                            │
│ Route: /onboarding/review                           │
│ Back → Step 16 (HEXACO-60)                          │
│ Next → Step 18 (DNA Reveal)                         │
│ Phase 1: User verifies all input data               │
├─────────────────────────────────────────────────────┤
│ STEP 18: DNA Reveal - REVEAL                        │
│ Route: /onboarding/dna-reveal                       │
│ Back → Step 17 (Review)                             │
│ Next → Step 19 (Code of Conduct)                    │
│ Phase 2: DNA Radar Chart reveals temperament        │
├─────────────────────────────────────────────────────┤
│ STEP 19: Code of Conduct - COMMIT                   │
│ Route: /onboarding/code-of-conduct                  │
│ Back → Step 18 (DNA Reveal)                         │
│ Next → Step 20 (Covenant)                           │
│ Phase 3: Community standards agreement              │
├─────────────────────────────────────────────────────┤
│ STEP 20: Covenant - SEAL                            │
│ Route: /onboarding/covenant                         │
│ Back → Step 19 (Code of Conduct)                    │
│ Next → Submit & Redirect to Dashboard (/)           │
│ Phase 4: Final covenant commitment                  │
└─────────────────────────────────────────────────────┘
```

---

## Quick Reference Table

| Step | Route | Title | Back To | Next To |
|------|-------|-------|---------|---------|
| 1 | `/welcome` | Welcome | — | Identity (2) |
| 2 | `/identity` | Basic Info | Welcome (1) | Location (3) |
| 3 | `/location` | Location | Identity (2) | Interests (4) |
| 4 | `/interests` | Interest Areas | Location (3) | Natural Giftings (5) |
| 5 | `/natural-giftings` | Natural Giftings | Interests (4) | Supernatural (6) |
| 6 | `/supernatural-giftings` | Supernatural Gifts | Natural (5) | Ministry (7) |
| 7 | `/ministry-experience` | Ministry Experience | Supernatural (6) | Milestones (8) |
| 8 | `/milestones` | Spiritual Milestones | Ministry (7) | Growth Areas (9) |
| 9 | `/growth-areas` | Areas of Growth | Milestones (8) | Leadership (10) |
| 10 | `/leadership-patterns` | Leadership Patterns | Growth (9) | Life Stages (11) |
| 11 | `/life-stages` | Life Stages | Leadership (10) | Callings (12) |
| 12 | `/callings` | Calling Trajectories | Life Stages (11) | Healing (13) |
| 13 | `/healing-themes` | Healing Themes | Callings (12) | Practices (14) |
| 14 | `/practices` | Rhythms & Practices | Healing (13) | Boundaries (15) |
| 15 | `/boundaries` | Boundaries | Practices (14) | HEXACO-60 (16) |
| 16 | `/hexaco-60` | DNA Discovery | Boundaries (15) | Review (17) |
| 17 | `/review` | Review (VERIFY) | HEXACO-60 (16) | DNA Reveal (18) |
| 18 | `/dna-reveal` | DNA Reveal (REVEAL) | Review (17) | Code of Conduct (19) |
| 19 | `/code-of-conduct` | Code of Conduct (COMMIT) | DNA Reveal (18) | Covenant (20) |
| 20 | `/covenant` | Covenant (SEAL) | Code of Conduct (19) | Dashboard (/) |

---

## Skippable Steps

Steps 5-15 (all spiritual layers) are **skippable**:
- Natural Giftings (5)
- Supernatural Giftings (6)
- Ministry Experience (7)
- Spiritual Milestones (8)
- Areas of Growth (9)
- Leadership Patterns (10)
- Life Stages (11)
- Calling Trajectories (12)
- Healing Themes (13)
- Rhythms & Practices (14)
- Boundaries (15)

Steps 1-4, 16-20 are **required**.

---

## Common Issues Fixed

### Issue 1: Natural Giftings Back Button
- ❌ **Was**: Going to HEXACO-60 (step 16)
- ✅ **Now**: Goes to Interests (step 4)

### Issue 2: Step Numbers Off By One
- ❌ **Was**: All spiritual layers (steps 5-15) had stepNumber +1
- ✅ **Now**: Corrected to proper sequence

### Issue 3: Sidebar Highlighting Wrong Step
- ❌ **Was**: Showing supernatural-giftings when on natural-giftings
- ✅ **Now**: Sidebar matches actual step number

---

## Verification Commands

```bash
# Check all step numbers
cd src/app/onboarding
for dir in */; do
  if [ -f "$dir/page.tsx" ]; then
    echo "${dir%/}:"
    grep "stepNumber=" "$dir/page.tsx"
  fi
done

# Verify routing
grep -r "router.push('/onboarding/" */page.tsx | grep -v node_modules
```

---

## Testing Checklist

- [x] Step 1-4: Identity pillar flows correctly
- [x] Step 5: Natural Giftings back goes to Interests
- [x] Step 6-12: Stewardship pillar flows sequentially
- [x] Step 13-15: Rhythms pillar flows sequentially
- [x] Step 16: HEXACO-60 goes to Review (not Natural Giftings)
- [x] Step 17-20: 4-phase flow works correctly
- [x] Sidebar highlights correct step
- [x] All totalSteps show 20

---

**Status**: ✅ All routing verified and fixed

**Last Updated**: March 1, 2026
