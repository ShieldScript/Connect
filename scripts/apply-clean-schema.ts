import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyCleanSchema() {
  const client = await pool.connect();

  try {
    console.log('🔍 Step 1: Backing up current data...\n');

    // Backup Interests
    const interests = await client.query('SELECT * FROM "Interest"');
    console.log(`✅ Backed up ${interests.rowCount} interests`);

    // Backup Person data (only fields we're keeping)
    const persons = await client.query(`
      SELECT
        id, "supabaseUserId", email, "displayName",
        latitude, longitude, "onboardingLevel",
        "leadershipSignals", "gamificationMeta",
        "blockedPersons", "safetyFlags", "lastActiveAt",
        "createdAt", "updatedAt"
      FROM "Person"
    `);
    console.log(`✅ Backed up ${persons.rowCount} person(s)`);

    // Backup PersonInterest (only fields we're keeping)
    const personInterests = await client.query(`
      SELECT id, "personId", "interestId", "proficiencyLevel", "createdAt"
      FROM "PersonInterest"
    `);
    console.log(`✅ Backed up ${personInterests.rowCount} person-interest mappings\n`);

    // Save backups to files
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      path.join(backupDir, `interests-${timestamp}.json`),
      JSON.stringify(interests.rows, null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, `persons-${timestamp}.json`),
      JSON.stringify(persons.rows, null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, `person-interests-${timestamp}.json`),
      JSON.stringify(personInterests.rows, null, 2)
    );

    console.log(`💾 Backups saved to: ${backupDir}\n`);

    console.log('🗑️  Step 2: Dropping old tables...\n');

    // Drop all tables and extensions
    await client.query('DROP TABLE IF EXISTS "SafetyReport" CASCADE');
    await client.query('DROP TABLE IF EXISTS "PersonInterest" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Interest" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Person" CASCADE');
    await client.query('DROP TABLE IF EXISTS "GroupMembership" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Group" CASCADE');
    await client.query('DROP TABLE IF EXISTS "CompatibilityScore" CASCADE');
    await client.query('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE');

    console.log('✅ All tables dropped\n');

    console.log('📝 Step 3: Now run these commands:\n');
    console.log('   1. mv prisma/schema.prisma prisma/schema-old.prisma');
    console.log('   2. mv prisma/schema-clean.prisma prisma/schema.prisma');
    console.log('   3. rm -rf prisma/migrations');
    console.log('   4. npx prisma migrate dev --name init');
    console.log('   5. npx tsx scripts/restore-data.ts\n');

    console.log('✅ Database reset complete!\n');

    return {
      interests: interests.rows,
      persons: persons.rows,
      personInterests: personInterests.rows,
    };

  } finally {
    client.release();
    await pool.end();
  }
}

applyCleanSchema().catch(console.error);
