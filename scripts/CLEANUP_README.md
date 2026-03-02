# Data Cleanup Tools

This directory contains scripts to clean up corrupted data from the `customLabel` → `customValue` migration.

## The Issue

Prior to 2026-02-27, the `CategoryGridLayerStep` component incorrectly stored custom pill names in a `customLabel` field instead of `customValue`. This caused:
- Orphaned numeric IDs appearing on the review page (e.g., "1772170456039")
- Custom pills not displaying correctly
- Data mismatch between frontend store and database expectations

## Cleanup Tools

### 1. Database Cleanup (Server-Side)

Removes corrupted custom entries from the database where `customName` is null/empty.

**Run:**
```bash
npm run db:clean
```

**What it does:**
- Deletes all records with `type=CUSTOM` or `style=CUSTOM` but no `customName`
- Affects all 11 spiritual resume layers:
  - Natural Giftings
  - Supernatural Giftings
  - Ministry Experiences
  - Spiritual Milestones
  - Growth Areas
  - Leadership Patterns
  - Life Stages
  - Calling Trajectories
  - Healing Themes
  - Rhythms & Practices
  - Boundaries & Availability

**Safe to run:** Yes, only removes invalid entries that would fail to display anyway.

### 2. LocalStorage Cleanup (Client-Side)

Automatically migrates old `customLabel` data to `customValue` in browser localStorage.

**How it works:**
- Runs automatically on every page load via `StorageCleanup` component
- Migrates `customLabel` → `customValue` for all entries
- Removes orphaned numeric IDs (timestamps without CUSTOM_ prefix)
- No user action required

**Manual cleanup (nuclear option):**
```javascript
// In browser console
import { clearOnboardingStorage } from '@/lib/cleanup-localStorage';
clearOnboardingStorage();
```

This completely clears onboarding storage and forces users to restart.

## When to Use

### Database Cleanup
Run `npm run db:clean` if:
- Users report seeing blank custom pills on their profile
- You're migrating from pre-2026-02-27 codebase
- After testing with corrupted data

### LocalStorage Cleanup
- **Automatic** - Already integrated, no action needed
- Users will see console logs like:
  ```
  🧹 Removing orphaned numeric ID: 1772170456039
  🔄 Migrating customLabel to customValue for: CUSTOM_1708876543210
  ✅ localStorage cleanup complete
  ```

## Verification

After cleanup, verify:

1. **Database:** No records with `type=CUSTOM` and `customName=null`
   ```sql
   SELECT * FROM "PersonNaturalGifting" WHERE type = 'CUSTOM' AND "customName" IS NULL;
   -- Should return 0 rows
   ```

2. **LocalStorage:** Check browser DevTools → Application → Local Storage
   - All entries should have `customValue` (not `customLabel`)
   - No orphaned numeric IDs as keys

3. **Review Page:** Custom pills display with actual names, not IDs

## Prevention

The fix is now in place:
- ✅ `CategoryGridLayerStep` uses `customValue`
- ✅ Store interface defines `customValue`
- ✅ Review page expects `customValue`
- ✅ Automatic migration on app load

No further action needed for new data.
