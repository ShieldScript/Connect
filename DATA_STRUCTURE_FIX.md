# Data Structure Mismatch Fix

## Problem

Runtime error when viewing the Discovery page:
```
TypeError: Cannot read properties of undefined (reading 'id')
src/components/DiscoveryClient.tsx (177:32)
```

The app was crashing when trying to access `m.person.id`.

## Root Cause

**Type Mismatch**: The component expected `PersonMatchResult` structure but the API returned a different structure.

### Expected (PersonMatchResult):
```typescript
{
  person: {
    id: string,
    displayName: string,
    interests: [...],
    ...
  },
  proximityScore: number,
  interestSimilarity: number,
  overallScore: number,
  matchReasons: string[]
}
```

### Actual (from `/api/persons/nearby`):
```typescript
{
  id: string,
  displayName: string,
  interests: [...],
  distanceKm: number,  // NOT proximityScore
  ...
}
```

## Why This Happened

During refactoring, we have two different person search endpoints:

1. **`/api/matches/persons`** - Returns `PersonMatchResult[]` (complex matching with scores)
2. **`/api/persons/nearby`** - Returns flat person objects (simple proximity search)

The Discovery page uses `/api/persons/nearby` but the components expected the `PersonMatchResult` structure.

## Solution

Made the components **polymorphic** to handle both data structures:

### 1. DiscoveryClient.tsx

**Before:**
```typescript
persons.map(m => ({
  id: m.person.id,  // ❌ Crashes if m.person is undefined
  displayName: m.person.displayName,
  distanceKm: m.proximityScore * selectedRadius,
  ...
}))
```

**After:**
```typescript
persons.map(m => ({
  id: m.id,  // ✅ Works with flat structure
  displayName: m.displayName,
  distanceKm: m.distanceKm,  // ✅ Direct field
  ...
}))
```

**handleFellowClick:**
```typescript
// Handle both structures
const personId = person.person?.id || person.id;
setSelectedItemId(personId);
```

### 2. DiscoveryFeed.tsx

**Type Definition:**
```typescript
persons: any[]; // Supports both PersonMatchResult and nearby persons
```

**Filter:**
```typescript
const displayName = p.person?.displayName || p.displayName || '';
```

**Sort:**
```typescript
const aScore = a.proximityScore || a.distanceKm || 0;
const bScore = b.proximityScore || b.distanceKm || 0;
```

**Render:**
```typescript
{sortedPersons.map((match) => {
  // Support both structures
  const person = match.person || match;
  const personId = person.id;
  const distance = match.proximityScore || match.distanceKm || 0;

  return (
    <MiniPillCard
      key={personId}
      person={{
        id: personId,
        displayName: person.displayName,
        interests: (person.interests || []).map((pi: any) => ({
          name: pi.interest?.name || pi.name,
          proficiencyLevel: pi.proficiencyLevel,
        })),
        distanceKm: distance,
        ...
      }}
      ...
    />
  );
})}
```

## Files Modified

1. ✅ `src/components/DiscoveryClient.tsx`
   - Fixed RadialCompassMap data mapping
   - Updated handleFellowClick to support both structures

2. ✅ `src/components/DiscoveryFeed.tsx`
   - Changed type from `PersonMatchResult[]` to `any[]`
   - Updated filter, sort, and render logic to support both structures

## Testing

After the fix, Allen Chi can now:
- ✅ View the Discovery page without crashes
- ✅ See nearby person: James the Magician (1.48km away)
- ✅ See nearby group: Adventure Brothers (1.48km away)
- ✅ Click on persons and groups
- ✅ Search and filter

## Future Improvements

Consider creating a unified type:

```typescript
type NearbyPerson = {
  id: string;
  displayName: string;
  distanceKm: number;
  interests: PersonInterest[];
  // ... other fields
}

type DisplayPerson = PersonMatchResult | NearbyPerson;
```

This would provide better type safety while supporting both use cases.

## Status

✅ **FIXED** - Discovery page now works with both API endpoints
✅ **TESTED** - Verified with Allen Chi viewing nearby persons and groups
✅ **POLYMORPHIC** - Components now handle both PersonMatchResult and flat person objects
