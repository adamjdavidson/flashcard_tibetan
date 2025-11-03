# Audio Pronunciation Feature - Testing Guide

## Phase 3: Admin Recording (User Story 1)

### Test 1: Record Audio in Add Card Form
1. Navigate to **Admin → Card Management**
2. Click **"Add Card"** button
3. Fill in card details (front, back, etc.)
4. Scroll down to **"Pronunciation Audio (Optional)"** section
5. Click **"Start Recording"** button
   - ✅ Browser should ask for microphone permission
   - ✅ Grant permission
6. Speak a Tibetan word (or any word) for 2-5 seconds
7. Click **"Stop Recording"** button
   - ✅ Should see preview with audio controls
   - ✅ Duration should be displayed
8. Click **"Play"** on preview to verify recording
   - ✅ Should hear your recording
9. Click **"Use This Recording"**
   - ✅ Should see "✅ Audio recorded and ready to save" message
   - ✅ Loading spinner should appear briefly
   - ✅ Audio should upload to Supabase
10. Click **"Add Card"** to save
   - ✅ Card should be created with audio URL

### Test 2: Re-record Audio
1. In Add Card Form, click **"Start Recording"**
2. Record audio (any length < 30 seconds)
3. Click **"Stop Recording"**
4. Click **"Re-record"** button
   - ✅ Should reset to idle state
5. Record again and use this recording

### Test 3: 30-Second Limit
1. In Add Card Form, click **"Start Recording"**
2. Record for exactly 30 seconds
   - ✅ At 25 seconds: Should see warning "(Almost at limit)"
   - ✅ At 30 seconds: Should auto-stop
3. Verify preview shows 30 seconds duration

### Test 4: Edit Card - Replace Audio
1. Navigate to **Admin → Card Management**
2. Find a card with audio (or create one first)
3. Click **"Edit"** button
4. Scroll to **"Pronunciation Audio"** section
   - ✅ Should show existing audio player
5. Click **"Replace Audio"** button
6. Record new audio
7. Click **"Use This Recording"**
8. Click **"Save Changes"**
   - ✅ Card should be updated with new audio URL

### Test 5: Edit Card - Delete Audio
1. Edit a card with audio
2. Click **"Delete Audio"** button
   - ✅ Should show confirmation dialog
3. Confirm deletion
   - ✅ Audio should be removed from card
   - ✅ Old audio file should be deleted from Supabase Storage

### Test 6: Error Handling
1. In Add Card Form, click **"Start Recording"**
2. Deny microphone permission when prompted
   - ✅ Should show error message about permission
3. Try to record without microphone
   - ✅ Should show appropriate error

## Phase 4: Student Playback (User Story 2)

### Test 7: Play Audio on Front (Tibetan Text)
1. Navigate to **Study** section (home page)
2. Find or create a card where:
   - Front side contains **Tibetan text** (e.g., Tibetan numerals, Tibetan script)
   - Card has `audioUrl` set
3. View the front of the card
   - ✅ Should see **"▶ Listen"** button below Tibetan text
   - ✅ Button should NOT appear if front is English-only
4. Click **"▶ Listen"** button
   - ✅ Audio should start playing
   - ✅ Button should change to **"⏸ Stop"**
   - ✅ Button should have orange/pulse animation while playing
5. Let audio finish
   - ✅ Should auto-stop when finished
   - ✅ Button should return to **"▶ Listen"**
6. Click **"⏸ Stop"** while playing
   - ✅ Should stop immediately

### Test 8: Play Audio on Back (Tibetan Text)
1. In Study section, find a card with Tibetan text on the back
2. Click card to flip it
3. Verify back side shows Tibetan text
   - ✅ Should see **"▶ Listen"** button below Tibetan text
   - ✅ Button should NOT appear if back is English-only
4. Click **"▶ Listen"** button
   - ✅ Audio should play correctly

### Test 9: No Audio Button on English-Only Sides
1. Find a card where:
   - Front is English (e.g., "Hello")
   - Back has Tibetan text
   - Card has `audioUrl` set
2. View front of card
   - ✅ Should NOT see audio button (front is English-only)
3. Flip card to back
   - ✅ Should see audio button (back has Tibetan text)

### Test 10: No Audio Button When No Audio URL
1. Find a card without `audioUrl`
2. Even if card has Tibetan text
   - ✅ Should NOT see audio button (no audio available)

### Test 11: Multiple Audio Buttons
1. Create/edit a card where both front and back have Tibetan text
2. Set `audioUrl` on the card
3. View front
   - ✅ Should see audio button below Tibetan text on front
4. Flip to back
   - ✅ Should see audio button below Tibetan text on back

## Expected Behaviors

### ✅ Should Work:
- Recording starts immediately after permission granted
- Preview plays recorded audio
- MP3 conversion happens automatically
- Upload to Supabase Storage succeeds
- Audio button appears ONLY where Tibetan text exists
- Audio button appears ONLY when `audioUrl` is set
- Audio auto-stops when finished
- Manual stop works correctly
- Replace audio updates card
- Delete audio removes from card and storage

### ❌ Should NOT Work:
- Recording without microphone permission (should show error)
- Audio button on English-only text (should not appear)
- Audio button when `audioUrl` is null (should not appear)
- Recording > 30 seconds (should auto-stop at 30s)

## Troubleshooting

### "Microphone access denied" error
- Check browser permissions: Settings → Site Settings → Microphone
- Grant permission and reload page

### "Failed to convert audio to MP3" error
- Check browser console for details
- Verify `lamejs` package is installed: `npm list lamejs`

### "Failed to upload audio" error
- Check Supabase Storage bucket `card-audio` exists
- Verify bucket is public
- Check browser console for network errors

### Audio button not appearing
- Verify card has `audioUrl` set (check in database or admin edit form)
- Verify text contains Tibetan Unicode characters (U+0F00 to U+0FFF)
- Check browser console for errors

### Audio not playing
- Check audio URL is accessible (copy URL and open in new tab)
- Verify Supabase Storage bucket has public read access
- Check browser console for audio playback errors

