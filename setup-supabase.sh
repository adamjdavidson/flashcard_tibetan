#!/bin/bash
# Automated Supabase Setup Helper Script

set -e

echo "🚀 Supabase Automated Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "✅ Created .env.local"
  echo ""
  echo "⚠️  IMPORTANT: Please edit .env.local and add your Supabase credentials:"
  echo "   - VITE_SUPABASE_URL"
  echo "   - VITE_SUPABASE_ANON_KEY"
  echo "   - SUPABASE_SERVICE_ROLE_KEY (optional, for advanced features)"
  echo ""
  read -p "Press Enter after you've updated .env.local..."
fi

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "❌ Missing Supabase credentials in .env.local"
  exit 1
fi

echo "✅ Found Supabase credentials"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Database Schema:"
echo "   → Go to Supabase Dashboard → SQL Editor"
echo "   → Click 'New query'"
echo "   → Copy contents of: supabase-schema.sql"
echo "   → Paste and click 'Run'"
echo ""
echo "2. Storage Bucket:"
echo "   → Go to Storage → New bucket"
echo "   → Name: card-images"
echo "   → Check 'Public bucket'"
echo "   → Click 'Create'"
echo ""
echo "3. Create Admin User:"
echo "   → Go to Authentication → Users → Add user"
echo "   → Create user, copy UUID"
echo "   → Run in SQL Editor:"
echo "     INSERT INTO user_roles (user_id, role) VALUES ('UUID', 'admin');"
echo ""
echo "4. Test:"
echo "   → npm run dev"
echo "   → Navigate to 'Manage Cards'"
echo "   → Log in with admin credentials"
echo ""

# If node script exists, try to run it
if [ -f setup-supabase.js ]; then
  echo "Would you like to run the Node.js setup script? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    node setup-supabase.js
  fi
fi

echo "✅ Setup guide complete!"
echo "📚 See SUPABASE_SETUP.md for detailed instructions"

