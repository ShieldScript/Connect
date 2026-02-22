import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔧 Creating Group and GroupMembership tables...\n');

  try {
    // Create enums
    const enums = [
      `CREATE TYPE "GroupType" AS ENUM ('HOBBY', 'SUPPORT', 'SPIRITUAL', 'PROFESSIONAL', 'SOCIAL', 'OTHER')`,
      `CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED')`,
      `CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'LEADER', 'CREATOR')`,
      `CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REMOVED')`,
    ];

    for (const sql of enums) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (error: any) {
        if (error.meta?.driverAdapterError?.code === '42710') {
          console.log(`⚠️  Enum already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    console.log('✅ Enums created');

    // Create Group table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Group" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "type" "GroupType" NOT NULL,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "isVirtual" BOOLEAN NOT NULL DEFAULT false,
        "minSize" INTEGER NOT NULL DEFAULT 2,
        "maxSize" INTEGER,
        "currentSize" INTEGER NOT NULL DEFAULT 0,
        "createdBy" TEXT NOT NULL,
        "leaderIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "isPublic" BOOLEAN NOT NULL DEFAULT true,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    console.log('✅ Group table created');

    // Create GroupMembership table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GroupMembership" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        "personId" TEXT NOT NULL,
        "groupId" TEXT NOT NULL,
        "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
        "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
        "joinRequestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "joinedAt" TIMESTAMP(3),
        "lastEngagedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "GroupMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('✅ GroupMembership table created');

    // Create unique constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupMembership"
      ADD CONSTRAINT IF NOT EXISTS "GroupMembership_personId_groupId_key"
      UNIQUE ("personId", "groupId")
    `).catch(() => {
      console.log('⚠️  Unique constraint already exists');
    });

    // Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS "Group_latitude_longitude_idx" ON "Group"("latitude", "longitude")`,
      `CREATE INDEX IF NOT EXISTS "Group_status_idx" ON "Group"("status")`,
      `CREATE INDEX IF NOT EXISTS "Group_type_idx" ON "Group"("type")`,
      `CREATE INDEX IF NOT EXISTS "GroupMembership_personId_idx" ON "GroupMembership"("personId")`,
      `CREATE INDEX IF NOT EXISTS "GroupMembership_groupId_idx" ON "GroupMembership"("groupId")`,
      `CREATE INDEX IF NOT EXISTS "GroupMembership_status_idx" ON "GroupMembership"("status")`,
    ];

    for (const sql of indexes) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ Indexes created');

    console.log('\n✨ Group tables setup complete!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
