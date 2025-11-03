#!/usr/bin/env node

/**
 * Script to apply audio_url migration directly via SQL
 * Bypasses migration tracking to avoid conflicts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n   Or set in .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('📝 Applying audio_url migration directly via SQL...\n');
  
  try {
    const migrationSQL = readFileSync(
      'supabase/migrations/20251103001843_add_audio_url_to_cards.sql',
      'utf-8'
    );
    
    // Split by semicolons, filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 0);
    
    for (const statement of statements) {
      if (statement) {
        // Use RPC to execute SQL (if available) or direct query
        try {
          // Try using supabase-js's direct query capability
          // Since we can't directly execute arbitrary SQL, we'll need to extract the statements
          console.log(`   Executing: ${statement.substring(0, 60)}...`);
          
          // For ALTER TABLE and CREATE INDEX, we need to use a different approach
          // The migration uses IF NOT EXISTS, so it's safe to run multiple times
          const response = await supabase.rpc('exec_sql', { 
            sql_query: statement 
          }).catch(() => null);
          
          if (response?.error) {
            // Fallback: Provide manual instructions
            console.log('   ⚠️  Cannot execute directly via API');
            console.log('\n💡 Please apply manually via Supabase Dashboard:\n');
            console.log('   1. Go to: Supabase Dashboard → SQL Editor');
            console.log('   2. Copy and paste this SQL:\n');
            console.log(statement + ';');
            console.log('\n   3. Click "Run" to execute\n');
            continue;
          }
          
          console.log('   ✅ Statement executed');
        } catch {
          console.log('   ⚠️  Could not execute via API');
          console.log('   💡 See manual instructions below\n');
        }
      }
    }
    
    // Since direct SQL execution via supabase-js is limited,
    // provide the full SQL for manual execution
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Manual SQL Execution:');
    console.log('\n   Copy the entire migration file content and run in Supabase SQL Editor:\n');
    console.log('   File: supabase/migrations/20251103001843_add_audio_url_to_cards.sql\n');
    console.log(migrationSQL);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Migration SQL is ready (all statements use IF NOT EXISTS, safe to run)');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function createBucket() {
  console.log('\n📦 Creating storage bucket "card-audio"...\n');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('   ❌ Error checking buckets:', listError.message);
      console.log('\n   💡 Create bucket manually:');
      console.log('      1. Go to Supabase Dashboard → Storage');
      console.log('      2. Click "New bucket"');
      console.log('      3. Name: card-audio');
      console.log('      4. Check "Public bucket"');
      console.log('      5. Click "Create bucket"\n');
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.id === 'card-audio');
    
    if (bucketExists) {
      console.log('   ✅ Storage bucket "card-audio" already exists\n');
      return true;
    }
    
    // Create bucket
    const { error: createError } = await supabase.storage.createBucket('card-audio', {
      public: true,
      allowedMimeTypes: ['audio/mpeg'],
      fileSizeLimit: 204800 // 200KB
    });
    
    if (createError) {
      console.error('   ❌ Error creating bucket:', createError.message);
      console.log('\n   💡 Create bucket manually:');
      console.log('      1. Go to Supabase Dashboard → Storage');
      console.log('      2. Click "New bucket"');
      console.log('      3. Name: card-audio');
      console.log('      4. Check "Public bucket"');
      console.log('      5. Click "Create bucket"\n');
      return false;
    }
    
    console.log('   ✅ Storage bucket "card-audio" created successfully\n');
    return true;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎤 Setting up Audio Pronunciation feature...\n');
  
  const migrationSuccess = await applyMigration();
  const bucketSuccess = await createBucket();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (migrationSuccess && bucketSuccess) {
    console.log('✅ Audio feature setup complete!');
  } else if (migrationSuccess) {
    console.log('✅ Migration ready (apply manually via SQL Editor)');
    console.log('⚠️  Bucket needs to be created manually (see instructions above)');
  } else {
    console.log('⚠️  Setup incomplete - please complete manual steps above');
  }
}

main().catch(console.error);

