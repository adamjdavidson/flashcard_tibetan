#!/usr/bin/env node

/**
 * Script to apply migration that makes front column nullable
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
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('📝 Applying migration to allow NULL front for word/phrase cards...\n');

  const migrationSQL = readFileSync(
    'supabase/migrations/20251103030000_allow_null_front_for_word_phrase.sql',
    'utf-8'
  );

  console.log('⚠️  This migration needs to be run manually in Supabase SQL Editor:\n');
  console.log('   1. Go to: Supabase Dashboard → SQL Editor');
  console.log('   2. Copy and paste the SQL below\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(migrationSQL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('   3. Click "Run" to execute');
  console.log('   4. Then run: node cleanup-old-card-fields.js --execute\n');

  return true;
}

applyMigration().catch(console.error);
