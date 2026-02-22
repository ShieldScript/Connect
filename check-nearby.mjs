import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Find Allen Chi
const allen = await prisma.person.findFirst({
  where: {
    OR: [
      { email: { contains: 'allen' } },
      { displayName: { contains: 'Allen' } },
    ]
  }
});

if (!allen) {
  console.log('❌ Allen Chi not found in database');
  await prisma.$disconnect();
  process.exit(1);
}

console.log('\n📍 Allen Chi Location:');
console.log(`   Name: ${allen.displayName}`);
console.log(`   Email: ${allen.email}`);
console.log(`   Community: ${allen.community}`);
console.log(`   City: ${allen.city}`);
console.log(`   Coordinates: (${allen.latitude}, ${allen.longitude})`);
console.log(`   Proximity Radius: ${allen.proximityRadiusKm}km`);

if (!allen.latitude || !allen.longitude) {
  console.log('\n❌ Allen does not have coordinates set');
  await prisma.$disconnect();
  process.exit(1);
}

// Find nearby persons using PostGIS
const nearbyPersons = await prisma.$queryRaw`
  SELECT
    id,
    "displayName",
    community,
    city,
    latitude,
    longitude,
    ST_Distance(
      location::geography,
      ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography
    ) / 1000 as distance_km
  FROM "Person"
  WHERE id != ${allen.id}
    AND location IS NOT NULL
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography,
      ${allen.proximityRadiusKm * 1000}
    )
  ORDER BY distance_km ASC
`;

console.log(`\n👥 Nearby Persons (within ${allen.proximityRadiusKm}km):`);
console.log(`   Found: ${nearbyPersons.length} persons`);
nearbyPersons.forEach((p, idx) => {
  console.log(`   ${idx + 1}. ${p.displayName} - ${p.community}, ${p.city} (${p.distance_km.toFixed(2)}km)`);
});

// Find nearby groups using PostGIS
const nearbyGroups = await prisma.$queryRaw`
  SELECT
    id,
    name,
    "locationName",
    latitude,
    longitude,
    "isVirtual",
    ST_Distance(
      location::geography,
      ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography
    ) / 1000 as distance_km
  FROM "Group"
  WHERE location IS NOT NULL
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography,
      ${allen.proximityRadiusKm * 1000}
    )
  ORDER BY distance_km ASC
`;

console.log(`\n🔥 Nearby Circles (within ${allen.proximityRadiusKm}km):`);
console.log(`   Found: ${nearbyGroups.length} circles`);
nearbyGroups.forEach((g, idx) => {
  console.log(`   ${idx + 1}. ${g.name} - ${g.locationName} (${g.distance_km.toFixed(2)}km)`);
});

// Find virtual groups
const virtualGroups = await prisma.group.count({
  where: { isVirtual: true }
});

console.log(`\n🌐 Virtual Circles: ${virtualGroups}`);

console.log('\n' + '='.repeat(60));
console.log(`✅ Allen Chi can see:`);
console.log(`   - ${nearbyPersons.length} nearby brothers`);
console.log(`   - ${nearbyGroups.length} nearby circles`);
console.log(`   - ${virtualGroups} virtual circles`);
console.log(`   - Total: ${nearbyPersons.length + nearbyGroups.length + virtualGroups} items`);
console.log('='.repeat(60));

await prisma.$disconnect();
