#!/usr/bin/env node

/**
 * Script to analyze card migration status
 * Identifies:
 * 1. Cards that need migration (old fields only, new fields NULL)
 * 2. Cards that have both old and new fields (duplicates)
 * 3. Cards that are fully migrated (new fields only, old fields still present)
 * 4. Cards that are clean (new fields only, old fields cleared)
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

async function analyzeCards() {
  console.log('📊 Analyzing card migration status...\n');

  try {
    // Fetch all word/phrase cards
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, type, front, back_english, back_tibetan_script, tibetan_text, english_text, subcategory')
      .in('type', ['word', 'phrase'])
      .order('id');

    if (error) {
      console.error('❌ Error fetching cards:', error.message);
      return false;
    }

    if (!cards || cards.length === 0) {
      console.log('✅ No word/phrase cards found\n');
      return true;
    }

    console.log(`📋 Total word/phrase cards: ${cards.length}\n`);

    // Categorize cards
    const needsMigration = [];
    const hasBoth = [];
    const fullyMigrated = [];
    const clean = [];
    const invalid = [];

    for (const card of cards) {
      const hasOldFields = !!(card.front || card.back_english || card.back_tibetan_script);
      const hasNewFields = !!(card.tibetan_text || card.english_text);

      if (!hasNewFields && hasOldFields) {
        // Needs migration - has old fields, no new fields
        needsMigration.push({
          id: card.id,
          type: card.type,
          hasFront: !!card.front,
          hasBackEnglish: !!card.back_english,
          hasBackTibetanScript: !!card.back_tibetan_script
        });
      } else if (hasNewFields && hasOldFields) {
        // Has both - duplicate fields
        hasBoth.push({
          id: card.id,
          type: card.type,
          oldFields: {
            front: card.front || null,
            backEnglish: card.back_english || null,
            backTibetanScript: card.back_tibetan_script || null
          },
          newFields: {
            tibetanText: card.tibetan_text || null,
            englishText: card.english_text || null
          }
        });
      } else if (hasNewFields && !hasOldFields) {
        // Fully migrated and cleaned - only new fields
        clean.push({
          id: card.id,
          type: card.type
        });
      } else if (!hasNewFields && !hasOldFields) {
        // Invalid - no fields at all
        invalid.push({
          id: card.id,
          type: card.type
        });
      } else {
        // Fully migrated but old fields still present
        fullyMigrated.push({
          id: card.id,
          type: card.type
        });
      }
    }

    // Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Migration Status Summary:\n');

    console.log(`⚠️  Needs Migration: ${needsMigration.length} cards`);
    if (needsMigration.length > 0) {
      console.log('   These cards have old fields (front/back_english) but new fields are NULL');
      console.log('   Run the migration SQL to populate new fields\n');
    }

    console.log(`📋 Has Both Old & New Fields: ${hasBoth.length} cards`);
    if (hasBoth.length > 0) {
      console.log('   These cards have both old and new fields populated');
      console.log('   Consider cleaning up old fields after verifying migration\n');
    }

    console.log(`✅ Fully Migrated (with old fields): ${fullyMigrated.length} cards`);
    if (fullyMigrated.length > 0) {
      console.log('   These cards have new fields populated, old fields still exist');
      console.log('   Safe to clear old fields after verification\n');
    }

    console.log(`✨ Clean (new fields only): ${clean.length} cards`);
    if (clean.length > 0) {
      console.log('   These cards are fully migrated and old fields are cleared\n');
    }

    if (invalid.length > 0) {
      console.log(`❌ Invalid (no fields): ${invalid.length} cards`);
      console.log('   These cards have no content and may be corrupted\n');
    }

    // Show details if requested
    if (needsMigration.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  Cards That Need Migration:\n');
      needsMigration.slice(0, 10).forEach(card => {
        console.log(`   - ${card.id} (${card.type})`);
        if (card.hasFront) console.log('     Has: front');
        if (card.hasBackEnglish) console.log('     Has: back_english');
        if (card.hasBackTibetanScript) console.log('     Has: back_tibetan_script');
      });
      if (needsMigration.length > 10) {
        console.log(`   ... and ${needsMigration.length - 10} more`);
      }
    }

    if (hasBoth.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Cards With Both Old & New Fields (Potential Duplicates):\n');
      hasBoth.slice(0, 10).forEach(card => {
        console.log(`   - ${card.id} (${card.type})`);
        console.log(`     Old: front="${card.oldFields.front?.substring(0, 30) || 'NULL'}", back_english="${card.oldFields.backEnglish?.substring(0, 30) || 'NULL'}"`);
        console.log(`     New: tibetan_text="${card.newFields.tibetanText?.substring(0, 30) || 'NULL'}", english_text="${card.newFields.englishText?.substring(0, 30) || 'NULL'}"`);
      });
      if (hasBoth.length > 10) {
        console.log(`   ... and ${hasBoth.length - 10} more`);
      }
    }

    // Generate cleanup SQL if needed
    if (hasBoth.length > 0 || fullyMigrated.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🧹 Optional: Clean Up Old Fields\n');
      console.log('   After verifying that new fields work correctly, you can clear old fields:');
      console.log('   This will remove front, back_english, and back_tibetan_script from migrated cards\n');
      
      const idsToClean = [...hasBoth, ...fullyMigrated].map(c => c.id);
      console.log('   SQL to clear old fields (SAFE - only clears if new fields exist):\n');
      console.log('   ```sql');
      console.log('   -- Clear old fields from migrated cards');
      console.log('   UPDATE cards');
      console.log('   SET');
      console.log('     front = NULL,');
      console.log('     back_english = NULL,');
      console.log('     back_tibetan_script = NULL');
      console.log('   WHERE type IN (\'word\', \'phrase\')');
      console.log('     AND tibetan_text IS NOT NULL');
      console.log('     AND english_text IS NOT NULL');
      console.log('     AND (front IS NOT NULL OR back_english IS NOT NULL OR back_tibetan_script IS NOT NULL);');
      console.log('   ```\n');
      
      console.log(`   This would affect ${hasBoth.length + fullyMigrated.length} cards`);
    }

    // Check if migration needs to be run
    if (needsMigration.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔄 Next Steps: Run Migration\n');
      console.log('   1. Review the migration SQL:');
      console.log('      File: supabase/migrations/20251103021648_migrate_existing_cards.sql\n');
      console.log('   2. Run it via Supabase SQL Editor or apply-migration script\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  const success = await analyzeCards();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
