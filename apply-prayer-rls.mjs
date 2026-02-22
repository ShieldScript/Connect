import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔒 Applying RLS policies for Prayer Wall...\n');

  try {
    // Enable RLS on tables
    await prisma.$executeRawUnsafe('ALTER TABLE "PrayerPost" ENABLE ROW LEVEL SECURITY;');
    await prisma.$executeRawUnsafe('ALTER TABLE "PrayerResponse" ENABLE ROW LEVEL SECURITY;');
    await prisma.$executeRawUnsafe('ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;');
    console.log('✅ Enabled RLS on PrayerPost, PrayerResponse, Notification\n');

    // Drop existing policies if they exist
    const policiesToDrop = [
      'DROP POLICY IF EXISTS "Anyone can view active prayers" ON "PrayerPost";',
      'DROP POLICY IF EXISTS "Onboarded users can create prayers" ON "PrayerPost";',
      'DROP POLICY IF EXISTS "Authors can update their prayers" ON "PrayerPost";',
      'DROP POLICY IF EXISTS "Anyone can view prayer responses" ON "PrayerResponse";',
      'DROP POLICY IF EXISTS "Users can create prayer responses" ON "PrayerResponse";',
      'DROP POLICY IF EXISTS "Users can view their own notifications" ON "Notification";',
      'DROP POLICY IF EXISTS "Users can update their own notifications" ON "Notification";',
      'DROP POLICY IF EXISTS "System can insert notifications" ON "Notification";',
    ];

    for (const policy of policiesToDrop) {
      await prisma.$executeRawUnsafe(policy);
    }
    console.log('✅ Dropped existing policies (if any)\n');

    // PrayerPost policies
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Anyone can view active prayers"
        ON "PrayerPost" FOR SELECT
        USING (auth.uid() IS NOT NULL AND "deletedAt" IS NULL);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Onboarded users can create prayers"
        ON "PrayerPost" FOR INSERT
        WITH CHECK (
          auth.uid() IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM "Person"
            WHERE "supabaseUserId" = auth.uid()::text
            AND "onboardingLevel" >= 1
          )
        );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Authors can update their prayers"
        ON "PrayerPost" FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM "Person"
            WHERE "supabaseUserId" = auth.uid()::text
            AND "id" = "PrayerPost"."authorId"
          )
        );
    `);
    console.log('✅ Created PrayerPost policies\n');

    // PrayerResponse policies
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Anyone can view prayer responses"
        ON "PrayerResponse" FOR SELECT
        USING (auth.uid() IS NOT NULL);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can create prayer responses"
        ON "PrayerResponse" FOR INSERT
        WITH CHECK (
          auth.uid() IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM "Person"
            WHERE "supabaseUserId" = auth.uid()::text
            AND "id" = "PrayerResponse"."prayerId"
          )
        );
    `);
    console.log('✅ Created PrayerResponse policies\n');

    // Notification policies
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can view their own notifications"
        ON "Notification" FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM "Person"
            WHERE "supabaseUserId" = auth.uid()::text
            AND "id" = "Notification"."personId"
          )
        );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Users can update their own notifications"
        ON "Notification" FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM "Person"
            WHERE "supabaseUserId" = auth.uid()::text
            AND "id" = "Notification"."personId"
          )
        );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "System can insert notifications"
        ON "Notification" FOR INSERT
        WITH CHECK (true);
    `);
    console.log('✅ Created Notification policies\n');

    console.log('🎉 RLS policies successfully applied!\n');
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed to apply RLS policies:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
