import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.ts';
import { seedDatabase, DEMO_ACCOUNTS_DOC } from './seedData.ts';

async function runSeed() {
  try {
    await connectDB();
    await seedDatabase({ forceReset: true });

    console.log('\n=== HomeEase Demo Credentials ===');
    for (const acc of DEMO_ACCOUNTS_DOC) {
      console.log(`- ${acc.role.padEnd(20)} | ${acc.email.padEnd(28)} | ${acc.password}`);
    }
    console.log('=================================\n');
  } catch (err) {
    console.error('[HomeEase Seed] Failed:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runSeed();
