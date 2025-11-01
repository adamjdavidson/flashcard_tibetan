# User-Owned Cards Feature - Test Checklist

This checklist helps verify that the user-owned cards feature is working correctly.

## Prerequisites

1. ✅ Database migration has been run
   - **Option A (Automated):** `npm run migrate:user-cards`
   - **Option B (Manual):** Run SQL from `supabase/migrations/20241201000003_user_cards.sql` in Supabase SQL Editor
2. ✅ Environment variables are set (`.env.local`)
3. ✅ Development server is running (`npm run dev:vercel`)

## Database Migration Tests

### Schema Verification
- [ ] Open Supabase Dashboard → Table Editor → `cards` table
- [ ] Verify `user_id` column exists (UUID, nullable)
- [ ] Verify `is_master` column exists (boolean, default false)
- [ ] Verify existing cards have `is_master = true` and `user_id = NULL`

### RLS Policies Verification
- [ ] Open Supabase Dashboard → Authentication → Policies → `cards` table
- [ ] Verify policies exist:
  - [ ] "Users can read master and own cards"
  - [ ] "Users can insert own cards"
  - [ ] "Users can update own cards"
  - [ ] "Users can delete own cards"
  - [ ] "Admins can read all cards"
  - [ ] "Admins can insert any card"
  - [ ] "Admins can update any card"
  - [ ] "Admins can delete any card"

## Automated Tests

### Run Database Migration

First, apply the migration:
```bash
npm run migrate:user-cards
```

This will:
- Add `user_id` and `is_master` columns
- Update existing cards to be master cards
- Set up new RLS policies

### Run Test Script

After migration, run the test script:
```bash
npm run test:user-cards
```

Expected output:
- ✅ All schema checks pass
- ✅ Card transforms work correctly
- ✅ RLS policies are active
- ✅ All 10 tests pass

## Manual Functional Tests

### 1. User Card Creation (Non-Admin)

1. Log in as a regular user (not admin)
2. Navigate to "Manage Cards"
3. Click "+ Add Card"
4. Fill in card details:
   - [ ] Can fill all fields
   - [ ] Can upload an image (Upload button visible)
   - [ ] **Cannot** see "Generate AI Image" button (admin only)
   - [ ] **Cannot** see "Search Unsplash" button (admin only)
5. Submit the card
   - [ ] Card is created successfully
   - [ ] Card appears in the card list
   - [ ] Card shows "My Card" badge
   - [ ] Card is only visible to this user (not to other users)

### 2. Admin Card Creation

1. Log in as admin
2. Navigate to "Manage Cards"
3. Click "+ Add Card" or use "Quick Translate & Add Cards"
4. Fill in card details:
   - [ ] Can use all image options (Generate AI, Unsplash, Upload)
   - [ ] Can fill all fields
5. Submit the card
   - [ ] Card is created successfully
   - [ ] Card shows "★ Master" badge
   - [ ] Card is visible to all users

### 3. Card Ownership Visibility

**As Regular User:**
- [ ] Can see all master cards (with "★ Master" badge)
- [ ] Can see own cards (with "My Card" badge)
- [ ] Cannot see other users' cards

**As Admin:**
- [ ] Can see all cards (master + all user cards)
- [ ] Can see ownership badges

### 4. Card Editing Permissions

**As Regular User:**
- [ ] Can edit own cards (Edit button visible)
- [ ] Can delete own cards (Delete button visible)
- [ ] **Cannot** edit master cards (no Edit button)
- [ ] **Cannot** delete master cards (no Delete button)
- [ ] **Cannot** edit other users' cards

**As Admin:**
- [ ] Can edit any card
- [ ] Can delete any card

### 5. Admin Card Review

1. Log in as admin
2. Navigate to "Admin" → "Card Review" tab
3. Verify:
   - [ ] Can see all user-created cards (non-master)
   - [ ] Each card shows creator info
   - [ ] Can click "★ Promote to Master" button
   - [ ] Promotion works (card moves to master library)
   - [ ] Promoted card becomes visible to all users
   - [ ] Can delete user cards
   - [ ] Can refresh the list

### 6. Card Study (All Users)

1. Navigate to "Study" view
2. Verify:
   - [ ] Can study master cards
   - [ ] Can study own cards
   - [ ] Cards appear in study mode correctly
   - [ ] SM-2 progress tracking works for all cards

## Edge Cases

- [ ] User creates card, then admin promotes it → all users can see it
- [ ] User deletes own card → card disappears
- [ ] Admin deletes user card from review page → card is removed
- [ ] Multiple users create cards with same content → both exist independently
- [ ] User edits own card → changes save correctly
- [ ] Card image upload works for regular users
- [ ] Card image upload works for admins

## API Tests (Optional)

Test the API endpoints directly:

```bash
# Test admin stats (should include user cards)
curl http://localhost:3000/api/admin/stats

# Test user cards listing (admin only, requires auth)
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}'
```

## Expected Behaviors Summary

✅ **Users can:**
- Create their own cards
- Upload images (but not generate AI images)
- Edit/delete their own cards
- Study master cards + their own cards

❌ **Users cannot:**
- Generate AI images
- Edit/delete master cards
- See other users' cards

✅ **Admins can:**
- Create master cards (visible to all)
- Generate AI images
- Edit/delete any card
- Review and promote user cards
- See all cards

## Troubleshooting

### "User cannot create cards"
- Check RLS policy "Users can insert own cards" exists
- Verify user is authenticated (check Supabase Auth)

### "User cannot see master cards"
- Check RLS policy "Users can read master and own cards" exists
- Verify cards have `is_master = true` or `user_id = NULL`

### "Admin cannot promote cards"
- Check AdminCardReview component is loaded
- Verify admin has correct role in `user_roles` table
- Check Supabase logs for errors

### "Migration not working"
- Run migration SQL manually in Supabase SQL Editor
- Verify columns exist: `SELECT column_name FROM information_schema.columns WHERE table_name = 'cards';`

