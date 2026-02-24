/**
 * Seed test users for development
 * Creates Supabase Auth users + Person records
 * Run with: npx tsx scripts/seed-test-users.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.MIGRATION_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const testUsers = [
  {
    email: 'gil.molina@servingtheking.com',
    password: 'testpass123',
    displayName: 'Gil Molina',
  },
  {
    email: 'paul.lau@servingtheking.com',
    password: 'testpass123',
    displayName: 'Paul Lau',
  },
  {
    email: 'allen.chi@servingtheking.com',
    password: 'testpass123',
    displayName: 'Allen Chi',
  },
];

async function main() {
  console.log('🌱 Seeding test users...\n');

  for (const user of testUsers) {
    console.log(`👤 Creating user: ${user.email}`);

    try {
      // 1. Create or get Supabase Auth user
      let authUser;

      // Try to create the user
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for test users
        user_metadata: {
          display_name: user.displayName,
        },
      });

      if (signUpError) {
        // User might already exist, try to get them
        if (signUpError.message.includes('already registered') || signUpError.code === 'email_exists') {
          console.log(`   ⚠️  User already exists in Supabase Auth, fetching and updating password...`);

          // List users and find by email
          const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

          if (listError) throw listError;

          authUser = users.users.find(u => u.email === user.email);

          if (!authUser) {
            throw new Error(`Could not find existing user ${user.email}`);
          }

          // Update password for existing user
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            authUser.id,
            { password: user.password }
          );

          if (updateError) {
            console.log(`   ⚠️  Could not update password:`, updateError.message);
          } else {
            console.log(`   ✅ Password updated to: ${user.password}`);
          }
        } else {
          throw signUpError;
        }
      } else {
        authUser = newUser.user;
      }

      console.log(`   ✅ Supabase Auth user ready (ID: ${authUser.id})`);

      // 2. Create or update Person record
      // Check by both supabaseUserId AND email (in case of email change or old records)
      let existingPerson = await prisma.person.findUnique({
        where: { supabaseUserId: authUser.id },
      });

      if (!existingPerson) {
        // Also check by email in case there's an old record
        existingPerson = await prisma.person.findUnique({
          where: { email: user.email },
        });
      }

      if (existingPerson) {
        console.log(`   ⚠️  Person record already exists, updating...`);

        await prisma.person.update({
          where: { id: existingPerson.id },
          data: {
            supabaseUserId: authUser.id, // Update to correct supabaseUserId
            displayName: user.displayName,
            email: user.email,
            onboardingLevel: 0, // Reset to test onboarding
          },
        });
      } else {
        console.log(`   ➕ Creating Person record...`);

        await prisma.person.create({
          data: {
            supabaseUserId: authUser.id,
            email: user.email,
            displayName: user.displayName,
            onboardingLevel: 0, // Ready for onboarding
          },
        });
      }

      console.log(`   ✅ Person record ready`);
      console.log(`   🔑 Password: ${user.password}\n`);

    } catch (error) {
      console.error(`   ❌ Failed to create ${user.email}:`, error);
      console.log('');
    }
  }

  console.log('✨ Test user seeding complete!\n');
  console.log('📋 Test Users Summary:');
  console.log('━'.repeat(60));

  for (const user of testUsers) {
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Name:     ${user.displayName}`);
    console.log('─'.repeat(60));
  }

  console.log('\n💡 You can now sign in at http://localhost:3000/login');
  console.log('   All users have onboardingLevel = 0 (ready for onboarding flow)');
}

main()
  .catch((e) => {
    console.error('❌ Test user seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
