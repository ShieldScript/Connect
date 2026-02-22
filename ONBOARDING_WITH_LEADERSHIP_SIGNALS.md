# Onboarding Flow with Leadership Signals ✅

## Overview

The onboarding flow has been completely redesigned to capture **leadership signals** WITHOUT explicitly asking "Are you a leader?" This enables the "shoulder-tap" strategy where the app can later invite potential shepherds to start or lead groups.

---

## What Changed

### Database Schema Updates

#### Person Model
```prisma
model Person {
  // ... existing fields ...

  // NEW: Leadership Signals
  leadershipSignals Json?      // { willingness, hasAssets, notifyForNewGroups }
  isPotentialShepherd Boolean  @default(false) // Backend flag

  // ... rest of fields ...
}
```

#### PersonInterest Model
```prisma
model PersonInterest {
  // ... existing fields ...

  proficiencyLevel Int @default(1) // NEW: 1-5 scale (Novice to Expert/Pro)

  @@index([proficiencyLevel]) // NEW: For finding experts
}
```

### Onboarding Flow (4 Steps)

**Before:** 3 steps (Interests → Bio/Location → Complete)

**After:** 4 steps (Interests + Proficiency → Bio/Location → Leadership Signals → Complete)

---

## Step-by-Step Breakdown

### Step 1: Interest Selection + Proficiency Levels

**UI Changes:**
1. User selects 3+ interests (same as before)
2. **NEW:** For each selected interest, user sees a proficiency slider
3. Slider: 1-5 scale (Novice → Beginner → Competent → Advanced → Expert/Pro)
4. Labels update in real-time as slider moves

**Key UX Decision:**
- Default proficiency starts at level 2 (Beginner) to avoid intimidation
- Sliders appear in a dedicated "Your Experience Level" panel
- Copy: "This helps us connect you with the right people—whether you're learning or teaching."

**Data Collected:**
```typescript
interests: [
  { interestId: "uuid", proficiencyLevel: 3 }, // Competent
  { interestId: "uuid", proficiencyLevel: 5 }, // Expert/Pro
  { interestId: "uuid", proficiencyLevel: 2 }, // Beginner
]
```

**Leadership Signal #1: Competency**
- Anyone who selects 4 or 5 (Advanced/Expert) on ANY interest is flagged as a potential shepherd
- Backend logic: `isPotentialShepherd = interests.some(i => i.proficiencyLevel >= 4)`

---

### Step 2: Bio & Location

**No changes** - existing functionality:
- Optional bio (min 10 characters if provided)
- Optional location via browser geolocation
- Location privacy controls (defaults to APPROXIMATE)

---

### Step 3: Leadership Signals (NEW)

**Title:** "How do you want to connect?"
**Subtitle:** "Help us understand how you'd like to get involved."

#### Question 1: Willingness (REQUIRED)

**Prompt:** "How do you see yourself involved in a group?"

**Options:**
```
A. Just showing up to learn and hang out
B. I can help organize or host occasionally
C. I have skills/gear I'm willing to share/teach
```

**Backend Values:**
- Option A: `willingness: 'participate'`
- Option B: `willingness: 'help_organize'`
- Option C: `willingness: 'share_skills'`

**Leadership Signal #2: Willingness**
- Options B or C flag the person as willing to contribute beyond participation
- Backend logic: `isPotentialShepherd = willingness !== 'participate'`

---

#### Question 2: Assets (CONDITIONAL)

**Only shows if user selected Option B or C above**

**Prompt:** "Do you have gear, tools, or space you could share?"

**Subtext:** "For example: workshop space, camping gear, instruments, vehicles, etc."

**Options:**
```
• Yes
• Not right now
```

**Backend Values:**
- `hasAssets: true` or `hasAssets: false`

**Leadership Signal #3: Assets**
- Identifies who has resources to enable activities
- Used for future "shoulder-tap" invitations: *"You mentioned you have [gear]. Want to host a [activity] session?"*

---

#### Question 3: Group Archetype (REQUIRED)

**Prompt:** "Interested in starting something new?"

**Subtext:** "If there isn't a group for your interests nearby, would you want us to notify you when enough people join to start one together?"

**Options:**
```
• Yes, notify me
• Not interested
```

**Backend Values:**
- `notifyForNewGroups: true` or `notifyForNewGroups: false`

**Leadership Signal #4: Openness to Group Formation**
- Identifies "seed" people for new groups
- Used for invitations: *"Hey Mike, there are 5 guys nearby wanting to do Woodworking. Want to start a group together?"*

---

### Step 4: Completion

**No changes** - existing functionality:
- "You're all set!" message
- "Find My People" button
- Triggers onboarding API call
- Redirects to home page

---

## Backend Logic: `isPotentialShepherd` Flag

The backend automatically calculates whether someone is a potential shepherd based on the signals:

```typescript
const isPotentialShepherd =
  leadershipSignals.willingness !== 'participate' ||  // Willing to help/share
  interests.some(i => i.proficiencyLevel >= 4);       // Expert in something
```

**Criteria:**
- Willing to help organize OR share skills
- OR has Advanced/Expert proficiency in any interest

**Result:**
- `isPotentialShepherd: true` - User is flagged for future leadership opportunities
- `isPotentialShepherd: false` - User is a participant only (for now)

**Important:** This flag is NEVER shown to the user. It's purely for backend matching and notifications.

---

## Data Structure

### Onboarding Request Payload

```json
{
  "interests": [
    { "interestId": "uuid-1", "proficiencyLevel": 3 },
    { "interestId": "uuid-2", "proficiencyLevel": 5 },
    { "interestId": "uuid-3", "proficiencyLevel": 2 }
  ],
  "bio": "I love meeting new people and exploring the city...",
  "latitude": 49.2827,
  "longitude": -123.1207,
  "leadershipSignals": {
    "willingness": "share_skills",
    "hasAssets": true,
    "notifyForNewGroups": true
  }
}
```

### Onboarding Response

```json
{
  "message": "Onboarding completed successfully",
  "person": {
    "id": "uuid",
    "displayName": "John Doe",
    "bio": "I love meeting new people...",
    "onboardingLevel": 1,
    "isPotentialShepherd": true,
    "interests": [
      {
        "id": "uuid-1",
        "name": "Woodworking & Carpentry",
        "category": "craftsmanship_trades_maker",
        "proficiencyLevel": 5
      },
      {
        "id": "uuid-2",
        "name": "Hiking & Backpacking",
        "category": "outdoor_adventure",
        "proficiencyLevel": 3
      }
    ],
    "leadershipSignals": {
      "willingness": "share_skills",
      "hasAssets": true,
      "notifyForNewGroups": true
    }
  }
}
```

---

## Use Cases: The "Shoulder-Tap" Strategy

### Scenario 1: Expert in Activity

**Onboarding Data:**
- Interest: "Woodworking & Carpentry" with proficiencyLevel = 5 (Expert/Pro)
- Willingness: "share_skills"
- hasAssets: true
- isPotentialShepherd: true

**Later Invitation (via app notification or email):**
> *"Hey Mike, there are 5 guys nearby wanting to do Woodworking. You marked yourself as an Expert and mentioned you have tools. Want to host a 1-hour 'Shop Tour' to get it started?"*

---

### Scenario 2: Willing to Organize

**Onboarding Data:**
- Interest: "Hiking & Backpacking" with proficiencyLevel = 3 (Competent)
- Willingness: "help_organize"
- notifyForNewGroups: true
- isPotentialShepherd: true

**Later Invitation:**
> *"Hey Sarah, 8 people nearby want to join a Hiking group. You mentioned you're willing to help organize. Want to coordinate the first hike?"*

---

### Scenario 3: Not a Leader (Yet)

**Onboarding Data:**
- Interest: "BBQ & Grilling" with proficiencyLevel = 2 (Beginner)
- Willingness: "participate"
- notifyForNewGroups: false
- isPotentialShepherd: false

**Result:**
- User is matched to existing groups
- NOT invited to start or lead groups
- Can always update preferences later

---

## Finding Potential Shepherds

### Query: Find Experts in Activity

```typescript
// Find all experts in "Woodworking & Carpentry"
const experts = await prisma.personInterest.findMany({
  where: {
    interestId: woodworkingInterestId,
    proficiencyLevel: { gte: 4 }, // Advanced or Expert
  },
  include: {
    person: {
      select: {
        id: true,
        displayName: true,
        leadershipSignals: true,
        isPotentialShepherd: true,
      },
    },
  },
});
```

### Query: Find Shepherds Open to New Groups

```typescript
// Find potential shepherds who want to be notified
const shepherds = await prisma.person.findMany({
  where: {
    isPotentialShepherd: true,
    leadershipSignals: {
      path: ['notifyForNewGroups'],
      equals: true,
    },
  },
  include: {
    interests: {
      where: { proficiencyLevel: { gte: 4 } },
      include: { interest: true },
    },
  },
});
```

### Query: Find Shepherds with Assets

```typescript
// Find people with gear/space who are willing to share
const withAssets = await prisma.person.findMany({
  where: {
    leadershipSignals: {
      path: ['hasAssets'],
      equals: true,
    },
  },
  include: { interests: { include: { interest: true } } },
});
```

---

## Validation Rules

### Interests
- **Minimum:** 3 interests required
- **Maximum:** 20 interests
- **Proficiency:** Must be 1-5 (validated by slider)

### Bio
- **Minimum:** 10 characters (if provided)
- **Maximum:** 500 characters

### Leadership Signals
- **willingness:** REQUIRED (one of: participate, help_organize, share_skills)
- **hasAssets:** REQUIRED (boolean)
- **notifyForNewGroups:** REQUIRED (boolean)

---

## Testing the Flow

### Test User 1: Expert Shepherd

```bash
# Login as test user
# Navigate to /onboarding

# Step 1: Select interests
- Woodworking & Carpentry → Proficiency: 5 (Expert/Pro)
- Metalworking & Blacksmithing → Proficiency: 4 (Advanced)
- BBQ & Grilling → Proficiency: 3 (Competent)

# Step 2: Bio & Location
- Bio: "I've been woodworking for 15 years and love teaching others."
- Enable location: Yes

# Step 3: Leadership Signals
- Willingness: "I have skills/gear I'm willing to share/teach"
- Has assets: Yes
- Notify for new groups: Yes

# Expected Result:
- isPotentialShepherd: true ✅
- Flagged as expert in 2 activities
- Available for "shoulder-tap" invitations
```

### Test User 2: Participant Only

```bash
# Step 1: Select interests
- Hiking & Backpacking → Proficiency: 2 (Beginner)
- Trail Running → Proficiency: 1 (Novice)
- Camping & Bushcraft → Proficiency: 2 (Beginner)

# Step 2: Bio & Location
- Bio: "Just getting into outdoor activities."
- Enable location: Yes

# Step 3: Leadership Signals
- Willingness: "Just showing up to learn and hang out"
- Notify for new groups: No

# Expected Result:
- isPotentialShepherd: false ✅
- Matched to existing groups
- NOT invited to start/lead groups
```

---

## UI/UX Principles

### ✅ DO:
- Use friendly, non-intimidating language
- Frame questions as "How do you want to connect?" not "Are you a leader?"
- Show proficiency as "experience level" not "leadership potential"
- Make everything optional or low-pressure
- Use progressive disclosure (only show assets question if relevant)

### ❌ DON'T:
- Never use the word "leader" during onboarding
- Don't show `isPotentialShepherd` flag to users
- Don't make users feel obligated to lead
- Don't reveal the scoring/flagging system
- Don't pressure users to select high proficiency levels

---

## Future Enhancements (Post-MVP)

1. **Edit Proficiency Levels**
   - Allow users to update proficiency as they grow
   - Track proficiency changes over time

2. **Dynamic Shepherd Invitations**
   - Automatically notify shepherds when critical mass is reached
   - Template: *"5 people want to do [activity] near you. Start a group?"*

3. **Shepherd Dashboard**
   - Show potential group opportunities
   - Display interested participants
   - One-click group creation

4. **Leadership Evolution**
   - Track participation → helping → leading progression
   - Suggest leadership when patterns emerge
   - Celebrate leadership milestones

5. **Asset Marketplace**
   - Browse who has gear/space to share
   - Request access to assets
   - Build trust through lending

---

## Summary

✅ **Database Schema** - Updated with leadershipSignals and proficiencyLevel
✅ **4-Step Onboarding Flow** - Captures all signals without intimidation
✅ **Leadership Flag** - Auto-calculated `isPotentialShepherd` based on signals
✅ **Proficiency Tracking** - 1-5 scale for each interest
✅ **Shoulder-Tap Ready** - Backend can now identify and invite potential shepherds

**Philosophy:** Observe, flag, invite—NOT force or pressure.

**Result:** Users self-select into leadership roles naturally, when they're ready.
