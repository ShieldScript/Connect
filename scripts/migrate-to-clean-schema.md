# Migration Plan: Complex Schema → Clean Schema

## What We're Removing

### From Person table:
- ❌ `bio` - Not collected in onboarding UI
- ❌ `profileImageUrl` - Not in MVP onboarding
- ❌ `phone` - Not collected
- ❌ `locationPrivacy` - Not set in onboarding
- ❌ `proximityRadiusKm` - Not used
- ❌ `ageRange` - Not collected
- ❌ `gender` - Not collected
- ❌ `personalityTraits` - Not collected
- ❌ `groupPreferences` - Not collected
- ❌ `isPotentialShepherd` - Can calculate on-the-fly if needed
- ❌ PostGIS `location` column - Causing bugs, not needed for MVP

### From PersonInterest table:
- ❌ `weight` - Not used in UI

### Tables we're keeping as-is:
- ✅ Interest (already simple)
- ✅ SafetyReport (simplified but functional)

## Benefits

1. **No more database triggers** (PostGIS sync bugs eliminated)
2. **Pure Prisma** (no need for pg library)
3. **Simpler queries** (no complex joins)
4. **Faster development** (less fields to manage)
5. **Can upgrade Next.js** (Turbopack bugs were related to complex queries)

## Migration Steps

1. Backup current interests data
2. Backup current person onboarding data
3. Drop all tables
4. Apply clean schema
5. Re-seed interests
6. Restore person data (only fields that exist in clean schema)
