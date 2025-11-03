/**
 * Setup script for Audio Pronunciation feature
 * - Applies database migration (adds audio_url column)
 * - Creates card-audio storage bucket
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('📝 Step 1: Applying database migration...');
  
  try {
    const migrationSQL = readFileSync(
      'supabase/migrations/20251103001843_add_audio_url_to_cards.sql',
      'utf-8'
    );
    
    // Split by semicolons and filter empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Try direct query instead
          const { error: directError } = await supabase
            .from('_realtime')
            .select('*')
            .limit(0); // This is just to test connection
          
          // If RPC doesn't work, use execSync with Supabase CLI
          console.log('   Using Supabase CLI to apply migration...');
          try {
            execSync('npx supabase db push --include-all', { 
              stdio: 'inherit',
              encoding: 'utf-8'
            });
            console.log('   ✅ Migration applied via CLI');
            return true;
          } catch (cliError) {
            console.error('   ❌ Error applying migration:', cliError.message);
            console.log('   💡 You can apply the migration manually:');
            console.log('      1. Go to Supabase Dashboard → SQL Editor');
            console.log('      2. Copy contents of: supabase/migrations/20251103001843_add_audio_url_to_cards.sql');
            console.log('      3. Paste and run');
            return false;
          }
        }
      }
    }
    
    console.log('   ✅ Migration applied successfully');
    return true;
  } catch (error) {
    console.error('   ❌ Error reading migration file:', error.message);
    return false;
  }
}

async function createBucket() {
  console.log('📦 Step 2: Creating storage bucket "card-audio"...');
  
  // Check if bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('   ❌ Error checking buckets:', listError.message);
    return false;
  }
  
  const bucketExists = buckets.some(bucket => bucket.id === 'card-audio');
  
  if (bucketExists) {
    console.log('   ✅ Storage bucket "card-audio" already exists');
    return true;
  }
  
  // Create bucket
  const { error: createError } = await supabase.storage.createBucket('card-audio', {
    public: true,
    allowedMimeTypes: ['audio/mpeg'],
    fileSizeLimit: 204800 // 200KB max (for 30-second recordings at 64 kbps)
  });
  
  if (createError) {
    console.error('   ❌ Error creating bucket:', createError.message);
    console.log('   💡 You may need to create it manually:');
    console.log('      1. Go to Supabase Dashboard → Storage');
    console.log('      2. Click "New bucket"');
    console.log('      3. Name: card-audio');
    console.log('      4. Check "Public bucket"');
    console.log('      5. Click "Create bucket"');
    return false;
  }
  
  console.log('   ✅ Storage bucket "card-audio" created successfully');
  return true;
}

async function main() {
  console.log('🎤 Setting up Audio Pronunciation feature...\n');
  
  const migrationSuccess = await applyMigration();
  const bucketSuccess = await createBucket();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (migrationSuccess && bucketSuccess) {
    console.log('✅ Audio feature setup complete!');
    console.log('\nNext steps:');
    console.log('  - Phase 3: Implement User Story 1 (Admin Recording)');
    console.log('  - Phase 4: Implement User Story 2 (Student Playback)');
  } else {
    console.log('⚠️  Setup incomplete. Please complete manual steps above.');
    process.exit(1);
  }
}

main().catch(console.error);

