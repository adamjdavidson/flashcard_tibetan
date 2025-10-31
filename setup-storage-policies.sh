#!/bin/bash

# Automated Setup Script for Supabase Storage RLS Policies using Supabase CLI
#
# This script uses the Supabase CLI to apply storage policies via migrations.
#
# Usage:
#   supabase link --project-ref your-project-ref
#   npm run setup:storage
#
# Or if already linked:
#   npm run setup:storage

set -e

echo "🔧 Setting up Supabase Storage RLS policies using Supabase CLI..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install --save-dev supabase"
    echo ""
    echo "Or globally:"
    echo "  npx supabase --help"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Supabase project not initialized!"
    echo ""
    echo "Run first:"
    echo "  npx supabase init"
    exit 1
fi

# Check if linked to remote project
if ! grep -q "project_id" .supabase/config.toml 2>/dev/null; then
    echo "⚠️  Not linked to remote Supabase project!"
    echo ""
    echo "Link your project:"
    echo "  npx supabase link --project-ref your-project-ref"
    echo ""
    echo "You can find your project ref in Supabase Dashboard → Settings → General"
    exit 1
fi

echo "✅ Supabase CLI found"
echo "✅ Project linked"
echo ""

# Check if bucket exists (can't automate this, but we can check)
echo "📦 Make sure you've created the card-images bucket:"
echo "   1. Go to Supabase Dashboard → Storage"
echo "   2. Click 'New bucket'"
echo "   3. Name: card-images"
echo "   4. Check 'Public bucket'"
echo "   5. Click 'Create bucket'"
echo ""
read -p "Have you created the bucket? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the bucket first, then run this script again."
    exit 1
fi

echo ""
echo "🔨 Pushing migration to remote database..."
echo ""

# Push migration to remote database
npx supabase db push

echo ""
echo "✅ Storage policies have been applied!"
echo ""
echo "🎉 Setup complete! You can now upload images from your app."

