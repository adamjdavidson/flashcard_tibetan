#!/usr/bin/env node

/**
 * Script to safely clean up old card fields (front, back_english, back_tibetan_script)
 * from migrated cards that have new bidirectional fields populated.
 * 
 * SAFETY: Only clears old fields if new fields (tibetan_text, english_text) exist
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if it exists
try {
  const envPath = path.resolve(__dirname, '.env.local');
  if (readFileSync(envPath, 'utf8')) {
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...rest] = trimmed.split('=');
      if (!key || !rest.length) return;
      const value = rest.join('=').replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    });
  }
} catch (err) {
  // .env.local might not exist, that's ok
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n   Set in .env.local file or environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupOldFields(dryRun = true) {
  console.log(dryRun ? '🔍 DRY RUN: Analyzing cards for cleanup...\n' : '🧹 Cleaning up old card fields...\n');

  try {
    // First, check which cards would be affected
    const { data: cardsToClean, error: checkError } = await supabase
      .from('cards')
      .select('id, type, front, back_english, back_tibetan_script, tibetan_text, english_text')
      .in('type', ['word', 'phrase'])
      .not('tibetan_text', 'is', null)
      .not('english_text', 'is', null)
      .or('front.not.is.null,back_english.not.is.null,back_tibetan_script.not.is.null');

    if (checkError) {
      console.error('❌ Error checking cards:', checkError.message);
      return false;
    }

    if (!cardsToClean || cardsToClean.length === 0) {
      console.log('✅ No cards need cleanup - all are already clean!\n');
      return true;
    }

    console.log(`📋 Found ${cardsToClean.length} cards with old fields to clean\n`);

    // Show sample of what will be cleaned
    console.log('📝 Sample cards that will be cleaned:\n');
    cardsToClean.slice(0, 5).forEach(card => {
      console.log(`   - ${card.id} (${card.type})`);
      console.log(`     Old fields: front="${card.front?.substring(0, 30) || 'NULL'}", back_english="${card.back_english?.substring(0, 30) || 'NULL'}"`);
      console.log(`     New fields: tibetan_text="${card.tibetan_text?.substring(0, 30) || 'NULL'}", english_text="${card.english_text?.substring(0, 30) || 'NULL'}"`);
    });
    if (cardsToClean.length > 5) {
      console.log(`   ... and ${cardsToClean.length - 5} more\n`);
    }

    if (dryRun) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 DRY RUN - No changes made\n');
      console.log('   To actually clean up old fields, run:');
      console.log('   node cleanup-old-card-fields.js --execute\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    }

    // Actually perform the cleanup
    console.log('\n🧹 Cleaning up old fields...\n');

    // Update cards one by one (safer than bulk update)
    let successCount = 0;
    let errorCount = 0;

    for (const card of cardsToClean) {
      try {
        const { error: updateError } = await supabase
          .from('cards')
          .update({
            front: null,
            back_english: null,
            back_tibetan_script: null
          })
          .eq('id', card.id);

        if (updateError) {
          console.error(`   ❌ Error cleaning ${card.id}: ${updateError.message}`);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`   ✅ Cleaned ${successCount}/${cardsToClean.length} cards...`);
          }
        }
      } catch (err) {
        console.error(`   ❌ Exception cleaning ${card.id}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Cleanup Complete!\n');
    console.log(`   ✅ Successfully cleaned: ${successCount} cards`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount} cards`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return errorCount === 0;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  if (dryRun) {
    console.log('⚠️  This is a DRY RUN - no changes will be made\n');
  } else {
    console.log('⚠️  WARNING: This will permanently delete old fields from migrated cards!\n');
    console.log('   This script will clear: front, back_english, back_tibetan_script');
    console.log('   Only from cards that have new fields (tibetan_text, english_text) populated\n');
    
    // Wait a moment for user to read
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const success = await cleanupOldFields(dryRun);
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
