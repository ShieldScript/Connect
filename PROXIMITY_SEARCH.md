# Proximity Search Implementation (Task #6)

## Overview

Implemented PostGIS-powered proximity search for finding persons and groups nearby.

## Components Created

### 1. Proximity Service (`src/lib/services/proximityService.ts`)

Core service using PostGIS for geospatial queries:

- **`findPersonsNearby()`** - Find persons within radius
  - Uses `ST_Distance` for distance calculation
  - Uses `ST_DWithin` for efficient spatial filtering
  - Respects blocked users list
  - Filters by onboarding status (only shows onboarded users)

- **`findGroupsNearby()`** - Find groups within radius
  - Supports filters: type, tags, size range
  - Only shows ACTIVE and PUBLIC groups

- **`updatePersonLocation()`** - Sync lat/lng to PostGIS geography column
- **`updateGroupLocation()`** - Sync lat/lng to PostGIS geography column
- **`calculateDistance()`** - Haversine formula fallback

### 2. API Endpoints

#### GET `/api/persons/nearby`

Find persons nearby with privacy filtering.

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in km (1-200, default: user's proximityRadiusKm)
- `limit` (optional): Max results (1-100, default: 20)

**Response:**
```json
{
  "persons": [
    {
      "id": "uuid",
      "displayName": "John Doe",
      "bio": "Love hiking...",
      "profileImageUrl": "https://...",
      "location": {
        "latitude": 49.28,
        "longitude": -123.12
      },
      "interests": [...],
      "groups": [...],
      "distanceKm": 2.5
    }
  ],
  "count": 10,
  "searchParams": {
    "latitude": 49.28,
    "longitude": -123.12,
    "radiusKm": 50,
    "limit": 20
  }
}
```

**Features:**
- ✅ Requires authentication
- ✅ Requires onboarding completion
- ✅ Applies privacy filtering (respects blockedPersons list)
- ✅ Filters sensitive data (no email, phone, etc.)
- ✅ Respects location privacy settings (EXACT, APPROXIMATE, CITY_ONLY, HIDDEN)

#### GET `/api/groups/nearby`

Find groups nearby with filtering options.

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in km (1-200, default: user's proximityRadiusKm)
- `type` (optional): Group type (HOBBY, SUPPORT, SPIRITUAL, PROFESSIONAL, SOCIAL, OTHER)
- `tags` (optional): Comma-separated tags (e.g., "hiking,outdoors")
- `minSize` (optional): Minimum member count
- `maxSize` (optional): Maximum member count
- `limit` (optional): Max results (1-100, default: 50)

**Response:**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Vancouver Hikers",
      "description": "Weekly hiking group...",
      "imageUrl": "https://...",
      "type": "HOBBY",
      "currentSize": 12,
      "tags": ["hiking", "outdoors", "fitness"],
      "latitude": 49.28,
      "longitude": -123.12,
      "distanceKm": 3.2
    }
  ],
  "count": 5,
  "searchParams": {
    "latitude": 49.28,
    "longitude": -123.12,
    "radiusKm": 50,
    "type": "HOBBY",
    "tags": ["hiking"],
    "limit": 50
  }
}
```

**Features:**
- ✅ Requires authentication
- ✅ Requires onboarding completion
- ✅ Only shows ACTIVE and PUBLIC groups
- ✅ Supports multiple filters
- ✅ Tag filtering (post-query for flexibility)

### 3. Onboarding Integration

Updated onboarding flow to capture location:

**UI Changes (`src/app/onboarding/page.tsx`):**
- Added location request in Step 2 (bio screen)
- Browser geolocation API integration
- Optional location sharing
- Shows latitude/longitude when captured
- Error handling for location denial

**API Changes (`src/app/api/persons/me/onboarding/route.ts`):**
- Accepts `latitude` and `longitude` in request body
- Syncs to PostGIS geography column using `updatePersonLocation()`
- Location is optional (privacy-friendly)

## PostGIS Queries

### Person Proximity Query

```sql
SELECT
  p.id,
  p."displayName",
  p."profileImageUrl",
  p.bio,
  p.latitude,
  p.longitude,
  ST_Distance(
    p.location::geography,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography
  ) / 1000 as "distanceKm"
FROM "Person" p
WHERE
  p."onboardingLevel" >= 1
  AND ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
    $radiusKm * 1000
  )
  AND p.id != $currentUserId
  AND NOT (p.id = ANY($blockedPersons))
  AND p.location IS NOT NULL
ORDER BY "distanceKm" ASC
LIMIT $limit
```

**Key Functions:**
- `ST_Distance()` - Calculate accurate distance between geographies (meters)
- `ST_DWithin()` - Efficient spatial filter (uses GIST index)
- `ST_MakePoint()` - Create point from lat/lng
- `ST_SetSRID()` - Set spatial reference (4326 = WGS84)
- `::geography` - Cast to geography type for accurate distance (vs geometry)

### Group Proximity Query

```sql
SELECT
  g.id,
  g.name,
  g.description,
  g."imageUrl",
  g.type,
  g."currentSize",
  g.tags,
  g.latitude,
  g.longitude,
  ST_Distance(
    g.location::geography,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography
  ) / 1000 as "distanceKm"
FROM "Group" g
WHERE
  g.status = 'ACTIVE'
  AND g."isPublic" = true
  AND ST_DWithin(
    g.location::geography,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
    $radiusKm * 1000
  )
  AND g.location IS NOT NULL
  [AND g.type = $type]
  [AND g."currentSize" >= $minSize]
  [AND g."currentSize" <= $maxSize]
ORDER BY "distanceKm" ASC
LIMIT $limit
```

## Location Privacy

Privacy filtering is applied via `getVisibleLocation()` from `privacyService.ts`:

| Privacy Setting | Behavior |
|----------------|----------|
| **EXACT** | Returns exact coordinates |
| **APPROXIMATE** | Rounds to ~1km grid (0.01 degrees) |
| **CITY_ONLY** | Rounds to ~10km grid (0.1 degrees) |
| **HIDDEN** | Returns null (location not shown) |

**Default:** APPROXIMATE (privacy-first)

## Performance Optimizations

1. **GIST Spatial Indexes** (created in PostGIS setup):
   - `CREATE INDEX idx_person_location ON "Person" USING GIST(location);`
   - `CREATE INDEX idx_group_location ON "Group" USING GIST(location);`

2. **ST_DWithin vs ST_Distance**:
   - `ST_DWithin()` uses index for filtering (fast)
   - `ST_Distance()` only calculates distance for filtered results

3. **Geography vs Geometry**:
   - Using `geography` type for accurate global distances
   - Accounts for Earth's curvature (important for >1km distances)

4. **Result Limiting**:
   - Default limits (20 persons, 50 groups)
   - Max limits (100) to prevent performance issues

## Testing

### Manual Testing

1. **Complete onboarding with location:**
   ```bash
   # Login as allen.chi@servingtheking.com
   # Go to /onboarding
   # Enable location in Step 2
   # Complete onboarding
   ```

2. **Test person proximity search:**
   ```bash
   GET /api/persons/nearby?lat=49.2827&lng=-123.1207&radius=50
   ```

3. **Test group proximity search:**
   ```bash
   GET /api/groups/nearby?lat=49.2827&lng=-123.1207&radius=50&type=HOBBY
   ```

### Automated Testing (TODO)

Create tests for:
- Proximity calculations (different distances)
- Privacy filtering (blocked users)
- Location privacy settings (EXACT, APPROXIMATE, CITY_ONLY, HIDDEN)
- Edge cases (no location, invalid coordinates)

## Next Steps

1. ✅ Task #6 Complete: Proximity search working
2. **Task #7**: Implement compatibility matching algorithm
   - Use proximity scores from this service
   - Combine with interest similarity
   - Calculate overall compatibility
3. **Task #8**: Create matching API and caching
   - Cache top matches in CompatibilityScore table
   - Refresh matches daily/weekly
4. **Mobile App**: Build UI for browsing nearby persons/groups

## Notes

- ✅ PostGIS extension enabled
- ✅ Geography columns with triggers (auto-sync from lat/lng)
- ✅ GIST indexes for fast spatial queries
- ✅ Privacy-first approach (blocked users filtered)
- ✅ Location is optional during onboarding
- ✅ Accurate distance calculations (geography type)
- ✅ Efficient queries (ST_DWithin uses indexes)

## API Usage Examples

### Find persons nearby (current user's location)

```typescript
// Frontend code
const response = await fetch('/api/persons/nearby?lat=49.2827&lng=-123.1207&radius=25');
const data = await response.json();

console.log(`Found ${data.count} persons nearby`);
data.persons.forEach(person => {
  console.log(`${person.displayName} - ${person.distanceKm.toFixed(1)}km away`);
});
```

### Find hiking groups nearby

```typescript
const response = await fetch(
  '/api/groups/nearby?lat=49.2827&lng=-123.1207&radius=50&type=HOBBY&tags=hiking'
);
const data = await response.json();

console.log(`Found ${data.count} hiking groups nearby`);
data.groups.forEach(group => {
  console.log(`${group.name} - ${group.currentSize} members - ${group.distanceKm.toFixed(1)}km away`);
});
```

## Database Schema Support

**Person table:**
- `latitude: Float?`
- `longitude: Float?`
- `location: GEOGRAPHY(Point, 4326)` (PostGIS column)
- `proximityRadiusKm: Int` (default: 50)
- `locationPrivacy: LocationPrivacy` (default: APPROXIMATE)

**Group table:**
- `latitude: Float?`
- `longitude: Float?`
- `location: GEOGRAPHY(Point, 4326)` (PostGIS column)
- `isPublic: Boolean` (default: true)
