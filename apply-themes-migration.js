#!/usr/bin/env node

/**
 * Script to apply themes migration via Supabase CLI
 * This runs: npx supabase db push
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function applyMigration() {
  console.log('🎨 Applying Themes Migration...\n');

  try {
    // Check if Supabase CLI is available
    try {
      await execAsync('npx supabase --version');
    } catch {
      console.error('❌ Supabase CLI not found!');
      console.error('\nPlease install it first:');
      console.error('  npm install --save-dev supabase');
      process.exit(1);
    }

    // Check if project is linked (for remote projects)
    try {
      const { existsSync } = await import('fs');
      const { join } = await import('path');
      const projectRefPath = join(process.cwd(), '.supabase', 'project-ref');
      if (existsSync(projectRefPath)) {
        const { readFileSync } = await import('fs');
        const projectRef = readFileSync(projectRefPath, 'utf-8').trim();
        console.log(`✅ Project appears to be linked (ref: ${projectRef})\n`);
      } else {
        console.warn('⚠️  Warning: Project may not be linked to remote Supabase');
        console.warn('   If migration fails, run: npx supabase link --project-ref YOUR_PROJECT_REF\n');
      }
    } catch {
      // Ignore - we'll try the push anyway
      console.warn('⚠️  Could not verify project link status\n');
    }

    console.log('📤 Pushing migration to remote database...');
    console.log('   This will:');
    console.log('   - Apply any pending migrations');
    console.log('   - Create themes table for admin-managed presets');
    console.log('   - Create user_theme_preferences table for user choices');
    console.log('   - Set up RLS policies');
    console.log('   - Create default "Default Purple" theme\n');

    // Push migration with --include-all to apply all pending migrations
    // Note: If it's interactive, the user will need to confirm
    // We'll catch the error if it's non-interactive and suggest manual run
    let stdout, stderr;
    try {
      const result = await execAsync('npx supabase db push --include-all', {
        timeout: 30000 // 30 second timeout
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      // If it failed due to interactive prompt or existing policies, suggest manual run
      if (error.message.includes('policy') && error.message.includes('already exists')) {
        console.error('\n⚠️  Some migrations have already been partially applied.');
        console.error('\n💡 Solution: Run manually to handle conflicts:');
        console.error('   npx supabase db push --include-all');
        console.error('\n   Or apply just the themes migration via SQL Editor:');
        console.error('   Copy: supabase/migrations/20241202000001_themes.sql');
        console.error('   Paste in: Supabase Dashboard → SQL Editor');
        process.exit(1);
      }
      throw error;
    }

    if (stderr && !stderr.includes('INFO')) {
      console.error('⚠️  Warnings:', stderr);
    }

    if (stdout) {
      console.log(stdout);
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n🎨 Your app now supports:');
    console.log('   - Admin-created preset themes');
    console.log('   - User theme preferences');
    console.log('   - Custom color schemes');

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

