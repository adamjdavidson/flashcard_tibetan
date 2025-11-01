#!/usr/bin/env node
/**
 * Automated Supabase Setup Script
 * 
 * This script helps set up your Supabase project automatically.
 * You'll need your Supabase project URL and service_role key.
 * 
 * Usage:
 *   node setup-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables or prompt user
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  console.log('\nPlease set:');
  console.log('  VITE_SUPABASE_URL=your-project-url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('\nOr run:');
  console.log('  export VITE_SUPABASE_URL="your-url"');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  console.log('  node setup-supabase.js');
  process.exit(1);
}

// Create Supabase client with service role key (has admin access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// eslint-disable-next-line no-unused-vars
async function runSQL(_sql) {
  try {
    // Supabase REST API doesn't have direct SQL execution
    // We'll need to use the PostgREST API for table operations
    console.log('ℹ️  Note: Some operations need to be done via Supabase dashboard SQL Editor');
    console.log('   The schema file is ready at: supabase-schema.sql');
    return { success: true };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error };
  }
}

async function checkBucket() {
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error checking buckets:', error.message);
    return false;
  }
  
  const bucketExists = data.some(bucket => bucket.id === 'card-images');
  
  if (bucketExists) {
    console.log('✅ Storage bucket "card-images" already exists');
    return true;
  }
  
  // Try to create bucket
  console.log('📦 Creating storage bucket "card-images"...');
  const { error: bucketError } = await supabase.storage.createBucket('card-images', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  });
  
  if (bucketError) {
    console.error('❌ Error creating bucket:', bucketError.message);
    console.log('   You may need to create it manually in the Supabase dashboard');
    return false;
  }
  
  console.log('✅ Storage bucket "card-images" created successfully');
  return true;
}

// eslint-disable-next-line no-unused-vars
async function setupStoragePolicies() {
  console.log('📋 Setting up storage policies...');
  // Storage policies need to be set via SQL or dashboard
  // Providing SQL for manual execution
  console.log('ℹ️  Storage policies need to be set via SQL Editor:');
  console.log('   Run the storage policy SQL from supabase-schema.sql');
}

async function main() {
  console.log('🚀 Starting Supabase Setup...\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);
  
  // Test connection
  try {
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) throw error;
    console.log('✅ Connected to Supabase successfully\n');
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    console.log('\nPlease check your:');
    console.log('  - VITE_SUPABASE_URL (should be your project URL)');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (should be the service_role key)');
    process.exit(1);
  }
  
  // Check/create storage bucket
  console.log('📦 Checking storage bucket...');
  await checkBucket();
  console.log('');
  
  // Instructions for SQL schema
  console.log('📝 Database Schema Setup:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log('   2. Click "New query"');
  console.log('   3. Copy and paste the contents of supabase-schema.sql');
  console.log('   4. Click "Run" (or press Cmd/Ctrl + Enter)');
  console.log('');
  
  // Instructions for admin user
  console.log('👤 Admin User Setup:');
  console.log('   1. Go to Authentication → Users → Add user');
  console.log('   2. Create a user with your email and password');
  console.log('   3. Copy the user UUID');
  console.log('   4. Run this SQL in SQL Editor:');
  console.log('      INSERT INTO user_roles (user_id, role)');
  console.log('      VALUES (\'paste-uuid-here\', \'admin\');');
  console.log('');
  
  console.log('✅ Setup script complete!');
  console.log('\n📚 See SUPABASE_SETUP.md for detailed instructions.');
}

main().catch(console.error);

