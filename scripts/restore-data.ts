import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function restoreData() {
  const client = await pool.connect();

  try {
    // Find most recent backup files
    const backupDir = path.join(process.cwd(), 'backups');
    const files = fs.readdirSync(backupDir);

    const interestsFile = files.filter(f => f.startsWith('interests-')).sort().reverse()[0];
    const personsFile = files.filter(f => f.startsWith('persons-')).sort().reverse()[0];
    const personInterestsFile = files.filter(f => f.startsWith('person-interests-')).sort().reverse()[0];

    if (!interestsFile || !personsFile || !personInterestsFile) {
      throw new Error('Backup files not found!');
    }

    console.log('📂 Reading backup files...\n');
    const interests = JSON.parse(fs.readFileSync(path.join(backupDir, interestsFile), 'utf-8'));
    const persons = JSON.parse(fs.readFileSync(path.join(backupDir, personsFile), 'utf-8'));
    const personInterests = JSON.parse(fs.readFileSync(path.join(backupDir, personInterestsFile), 'utf-8'));

    console.log(`✅ Found ${interests.length} interests`);
    console.log(`✅ Found ${persons.length} person(s)`);
    console.log(`✅ Found ${personInterests.length} person-interest mappings\n`);

    console.log('📥 Restoring data...\n');

    // Restore Interests
    for (const interest of interests) {
      await client.query(
        `INSERT INTO "Interest" (id, name, category, description, popularity, subcategory, metadata, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          interest.id,
          interest.name,
          interest.category,
          interest.description,
          interest.popularity,
          interest.subcategory,
          interest.metadata,
          interest.createdAt,
        ]
      );
    }
    console.log(`✅ Restored ${interests.length} interests`);

    // Restore Persons
    for (const person of persons) {
      await client.query(
        `INSERT INTO "Person" (
          id, "supabaseUserId", email, "displayName",
          latitude, longitude, "onboardingLevel",
          "leadershipSignals", "gamificationMeta",
          "blockedPersons", "safetyFlags", "lastActiveAt",
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING`,
        [
          person.id,
          person.supabaseUserId,
          person.email,
          person.displayName,
          person.latitude,
          person.longitude,
          person.onboardingLevel,
          person.leadershipSignals,
          person.gamificationMeta,
          person.blockedPersons,
          person.safetyFlags,
          person.lastActiveAt,
          person.createdAt,
          person.updatedAt,
        ]
      );
    }
    console.log(`✅ Restored ${persons.length} person(s)`);

    // Restore PersonInterests
    for (const pi of personInterests) {
      await client.query(
        `INSERT INTO "PersonInterest" (id, "personId", "interestId", "proficiencyLevel", "createdAt")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [pi.id, pi.personId, pi.interestId, pi.proficiencyLevel, pi.createdAt]
      );
    }
    console.log(`✅ Restored ${personInterests.length} person-interest mappings\n`);

    console.log('🎉 Data restoration complete!\n');

  } finally {
    client.release();
    await pool.end();
  }
}

restoreData().catch(console.error);
