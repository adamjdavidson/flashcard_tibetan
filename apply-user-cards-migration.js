#!/usr/bin/env node

/**
 * Script to apply user-owned cards migration via Supabase CLI
 * This runs: npx supabase db push
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function applyMigration() {
  console.log('🔨 Applying User-Owned Cards Migration...\n');

  try {
    // Check if Supabase CLI is available
    try {
      await execAsync('npx supabase --version');
    } catch (error) {
      console.error('❌ Supabase CLI not found!');
      console.error('\nPlease install it first:');
      console.error('  npm install --save-dev supabase');
      process.exit(1);
    }

    // Check if project is linked (for remote projects)
    try {
      const { stdout } = await execAsync('npx supabase projects list 2>/dev/null || npx supabase link --help 2>&1 | head -1');
      // If project-ref file exists, assume it's linked
      const fs = await import('fs');
      const path = await import('path');
      const projectRefPath = path.join(process.cwd(), '.supabase', 'project-ref');
      if (fs.existsSync(projectRefPath)) {
        const projectRef = fs.readFileSync(projectRefPath, 'utf-8').trim();
        console.log(`✅ Project appears to be linked (ref: ${projectRef})\n`);
      } else {
        console.warn('⚠️  Warning: Project may not be linked to remote Supabase');
        console.warn('   If migration fails, run: npx supabase link --project-ref YOUR_PROJECT_REF\n');
      }
    } catch (error) {
      // Ignore - we'll try the push anyway
      console.warn('⚠️  Could not verify project link status\n');
    }

    console.log('📤 Pushing migration to remote database...');
    console.log('   This will:');
    console.log('   - Add user_id and is_master columns');
    console.log('   - Update existing cards to be master cards');
    console.log('   - Set up new RLS policies\n');

    // Push migration
    const { stdout, stderr } = await execAsync('npx supabase db push');

    if (stderr && !stderr.includes('INFO')) {
      console.error('⚠️  Warnings:', stderr);
    }

    if (stdout) {
      console.log(stdout);
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n🧪 You can now run tests:');
    console.log('   npm run test:user-cards');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('\nError:', error.message);

    if (error.message.includes('not linked')) {
      console.error('\n💡 Solution:');
      console.error('   1. Get your project ref from Supabase Dashboard → Settings → General');
      console.error('   2. Run: npx supabase link --project-ref YOUR_PROJECT_REF');
      console.error('   3. Run this script again');
    } else if (error.message.includes('password')) {
      console.error('\n💡 Solution:');
      console.error('   You may need to enter your database password.');
      console.error('   Run manually: npx supabase db push');
    } else {
      console.error('\n💡 Try running manually:');
      console.error('   npx supabase db push');
    }

    process.exit(1);
  }
}

applyMigration();

