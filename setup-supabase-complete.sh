#!/bin/bash

# Complete Supabase Setup Script
# This script automates the entire Supabase setup process

set -e

echo "🚀 Starting complete Supabase setup..."
echo ""

# Check if we have the required environment variables
if [ -z "$VITE_SUPABASE_URL" ] && [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL or SUPABASE_URL environment variable is required"
    echo ""
    echo "Please set it in .env.local:"
    echo "  VITE_SUPABASE_URL=https://your-project-ref.supabase.co"
    echo ""
    exit 1
fi

SUPABASE_URL=${VITE_SUPABASE_URL:-$SUPABASE_URL}

# Step 1: Install Supabase CLI
echo "📦 Step 1: Installing Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "  Installing via npm..."
    npm install --save-dev supabase
    echo "  ✅ Installed!"
else
    echo "  ✅ Already installed!"
fi

# Step 2: Initialize Supabase project
echo ""
echo "📂 Step 2: Initializing Supabase project..."
if [ ! -d "supabase" ]; then
    echo "  Running: npx supabase init"
    npx supabase init
    echo "  ✅ Initialized!"
else
    echo "  ✅ Already initialized!"
fi

# Step 3: Link to remote project (if not already linked)
echo ""
echo "🔗 Step 3: Linking to remote project..."
if [ ! -f ".supabase/config.toml" ] || ! grep -q "project_id" .supabase/config.toml 2>/dev/null; then
    # Extract project ref from URL
    PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
    
    if [ -z "$PROJECT_REF" ] || [ "$PROJECT_REF" = "$SUPABASE_URL" ]; then
        echo "  ⚠️  Could not extract project ref from URL"
        echo "  Please run manually:"
        echo "    npx supabase link --project-ref your-project-ref"
        echo ""
        echo "  Find your project ref in Supabase Dashboard → Settings → General"
        exit 1
    fi
    
    echo "  Linking to project: $PROJECT_REF"
    echo "  (You may be prompted for your database password)"
    npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" || {
        echo "  ⚠️  Could not auto-link. Please run manually:"
        echo "    npx supabase link --project-ref $PROJECT_REF"
        echo "  You'll need your database password from when you created the project."
    }
    echo "  ✅ Linked!"
else
    echo "  ✅ Already linked!"
fi

# Step 4: Check/create storage bucket
echo ""
echo "📦 Step 4: Checking storage bucket..."
echo "  ⚠️  Note: Storage bucket must be created manually in Supabase Dashboard"
echo "  Please:"
echo "    1. Go to Supabase Dashboard → Storage"
echo "    2. Click 'New bucket'"
echo "    3. Name: card-images"
echo "    4. Check 'Public bucket'"
echo "    5. Click 'Create bucket'"
echo ""
read -p "  Have you created the card-images bucket? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "  Please create the bucket first, then run this script again."
    exit 1
fi

# Step 5: Apply migrations
echo ""
echo "🔨 Step 5: Applying database migrations..."
echo "  This will set up:"
echo "    - Database tables (user_roles, cards, card_progress)"
echo "    - RLS policies"
echo "    - Storage policies"
echo ""
echo "  Pushing migrations to remote database..."
npx supabase db push

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your Supabase database is now set up!"
echo ""
echo "Next steps:"
echo "  1. Create an admin user in Supabase Dashboard → Authentication → Users"
echo "  2. Copy the user's UUID"
echo "  3. Run this SQL in SQL Editor:"
echo "     INSERT INTO user_roles (user_id, role) VALUES ('your-uuid-here', 'admin');"
echo ""
echo "Then you can start using the app!"

