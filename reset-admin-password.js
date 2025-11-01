#!/usr/bin/env node
/**
 * Reset Admin Password Script
 * 
 * This script resets the password for your admin user using Supabase Admin API.
 * 
 * Usage:
 *   node reset-admin-password.js
 * 
 * You'll be prompted for:
 *   - User email (default: adam@adamdavidson.com)
 *   - New password
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
let supabaseUrl, supabaseServiceKey;

try {
  const envFile = readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.error('Error reading .env.local:', error.message);
}

// Get from environment if not in .env.local
supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
supabaseServiceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  console.log('\nPlease set in .env.local or environment:');
  console.log('  VITE_SUPABASE_URL=your-project-url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('\nOr run:');
  console.log('  export VITE_SUPABASE_URL="your-url"');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  console.log('  node reset-admin-password.js');
  process.exit(1);
}

// Create Supabase admin client (using service role key for admin operations)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  try {
    console.log('🔐 Reset Admin Password');
    console.log('========================\n');
    
    const email = await question('Email (default: adam@adamdavidson.com): ') || 'adam@adamdavidson.com';
    const newPassword = await question('New password: ');
    
    if (!newPassword) {
      console.error('❌ Password cannot be empty!');
      rl.close();
      process.exit(1);
    }
    
    console.log('\n⏳ Resetting password...');
    
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User with email ${email} not found!`);
      rl.close();
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.email} (UID: ${user.id})`);
    
    // Update user password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    
    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
    
    console.log('\n✅ Password reset successfully!');
    console.log(`\nYou can now log in with:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}`);
    console.log('\n⚠️  Keep this password secure!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('service_role')) {
      console.log('\n💡 Make sure you\'re using the SERVICE_ROLE_KEY, not the anon key!');
      console.log('   Get it from: Supabase Dashboard → Settings → API → service_role key');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

resetPassword();

