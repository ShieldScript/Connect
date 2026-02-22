# PostGIS Location Field Bug Fix

## Problem

After the refactoring, users logging in (e.g., Allen Chi) saw **no nearby users or circles**, even though the data existed in the database.

## Root Cause

The PostGIS `location` field (Geometry type) was **NULL** for all Person and Group records, even though they had `latitude` and `longitude` values.

The spatial queries use `ST_DWithin()` and `ST_Distance()` which require the `location` field to be set. The refactoring removed or broke the code that updates this field.

## Investigation

```sql
SELECT
  "displayName",
  latitude,
  longitude,
  location IS NULL as location_is_null
FROM "Person"
WHERE "displayName" = 'Allen Chi';
```

Result: `location_is_null = true` ❌

## Solution

### 1. Fixed Existing Data (One-time)

```sql
-- Update all Person records
UPDATE "Person"
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;

-- Update all Group records
UPDATE "Group"
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;
```

Result: ✅ 11 persons and 4 groups updated

### 2. Fixed Onboarding Route

**File**: `src/app/api/persons/me/onboarding/route.ts`

Added PostGIS location update within the transaction:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update person record
  await tx.person.update({...});

  // 2. Replace interests
  await tx.personInterest.deleteMany({...});
  await tx.personInterest.createMany({...});

  // 3. Update PostGIS location field ⭐ NEW
  if (latitude && longitude) {
    await tx.$executeRaw`
      UPDATE "Person"
      SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      WHERE id = ${person.id}
    `;
  }
});
```

### 3. Fixed Seed Script

**File**: `prisma/seed.ts`

Added PostGIS location updates after creating persons and groups:

```typescript
// After creating persons
const personIdsToUpdateLocation: string[] = [];
for (const userData of testUsers) {
  const person = await prisma.person.upsert({...});
  if (userData.latitude && userData.longitude) {
    personIdsToUpdateLocation.push(person.id);
  }
}

// Batch update PostGIS locations
await prisma.$executeRaw`
  UPDATE "Person"
  SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  WHERE id = ANY(${personIdsToUpdateLocation}::text[])
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
`;
```

### 4. Created Comprehensive Seed Script

**File**: `scripts/seed-all-users.mts`

- Adds interests to all users (including real users: Allen, Paul, Gil)
- Adds users to groups
- Updates PostGIS location fields for all persons and groups
- Ensures proper relationships and data integrity

## Verification

### Allen Chi's State After Fix:

```
✅ Location: Calgary (51.0317576, -114.0667199)
✅ Onboarding Level: 1
✅ Interests: 10 (including Data Science, Software Development, Bible Study, Prayer)
✅ Active Groups: 2 (Wisdom Seekers, Fathers Forum)
```

### Nearby Queries Working:

**Nearby Persons (10km radius):**
- James the Magician (Calgary) - 1.48km ✅

**Nearby Groups (10km radius):**
- Adventure Brothers (Rockies Trailhead) - 1.48km ✅

## Files Modified

1. ✅ `src/app/api/persons/me/onboarding/route.ts` - Added PostGIS location update
2. ✅ `prisma/seed.ts` - Added PostGIS location batch updates
3. ✅ `scripts/seed-all-users.mts` - New comprehensive seed script

## All Real Test Users

| User | Email | Location | Interests | Groups |
|------|-------|----------|-----------|--------|
| Allen Chi | allen.chi@servingtheking.com | Calgary | 10 | 2 |
| Paul Lau | paul.lau@servingtheking.com | Toronto | 7 | 2 |
| Gil Molina | gil.molina@servingtheking.com | Toronto | 7 | 1 |

## Status

✅ **FIXED** - All users can now see nearby persons and groups
✅ **TESTED** - Verified with Allen Chi login
✅ **SEEDED** - All 11 users (8 test + 3 real) have interests and group memberships
✅ **FUTURE-PROOF** - Onboarding and seed scripts now properly set PostGIS location field

## Related Issues

This bug was introduced during the refactoring (Phase 3: Backend API Refactoring) when transactions were added to ensure atomicity. The PostGIS location update logic was accidentally omitted from the new transaction code.
