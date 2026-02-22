import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key to list users
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createPersonsForSupabaseUsers() {
  try {
    console.log('🔍 Fetching Supabase users...\n');

    // Get all Supabase users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error fetching Supabase users:', error.message);
      return;
    }

    console.log(`📊 Found ${users.users.length} Supabase users:\n`);

    // Expected users
    const expectedEmails = [
      'allen.chi@servingtheking.com',
      'paul.lau@servingtheking.com',
      'gil.molina@servingtheking.com'
    ];

    for (const user of users.users) {
      console.log(`👤 ${user.email}`);
      console.log(`   Supabase ID: ${user.id}`);

      // Check if Person record exists
      const existingPerson = await prisma.person.findUnique({
        where: { supabaseUserId: user.id }
      });

      if (existingPerson) {
        console.log(`   ✅ Person record exists: ${existingPerson.displayName}\n`);
        continue;
      }

      // Create Person record for expected users
      if (expectedEmails.includes(user.email!)) {
        const displayName = user.email!.split('@')[0]
          .split('.')
          .map(name => name.charAt(0).toUpperCase() + name.slice(1))
          .join(' ');

        const person = await prisma.person.create({
          data: {
            supabaseUserId: user.id,
            email: user.email!,
            displayName,
            onboardingLevel: 1, // Mark as onboarded
            proximityRadiusKm: 5,
            city: 'Toronto',
            region: 'Ontario',
            latitude: 43.6532,
            longitude: -79.3832,
            archetype: 'Builder',
            connectionStyle: 'workshop',
          }
        });

        console.log(`   ✨ Created Person record: ${person.displayName}`);
        console.log(`   🎯 ID: ${person.id}\n`);
      } else {
        console.log(`   ⚠️  Not in expected users list\n`);
      }
    }

    console.log('\n✅ Done! Checking final state...\n');

    // Show all persons
    const allPersons = await prisma.person.findMany({
      select: {
        displayName: true,
        email: true,
        supabaseUserId: true,
        onboardingLevel: true,
      }
    });

    console.log('📋 All Person records:');
    allPersons.forEach(p => {
      console.log(`   - ${p.displayName} (${p.email}) - Level ${p.onboardingLevel}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createPersonsForSupabaseUsers();
