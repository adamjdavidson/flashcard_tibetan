# Quickstart: Audio Pronunciation for Cards

**Created**: 2025-11-03  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

This quickstart guide helps admins record pronunciation audio for flashcards and students play pronunciation audio while studying.

## Prerequisites

### For Admins (Recording)
- Admin access to the application
- Microphone access (browser will prompt for permission)
- Modern browser with MediaRecorder API support:
  - Chrome 47+ (desktop/mobile)
  - Firefox 25+ (desktop)
  - Safari 14.1+ (desktop/mobile)

### For Students (Playback)
- Modern browser with HTML5 Audio support (all modern browsers)
- Speakers or headphones for audio playback

## Getting Started

### For Admins: Recording Pronunciation Audio

**Access Recording Interface**:
1. Log in as admin
2. Navigate to **Admin** → **Card Management**
3. Create a new card or edit an existing card
4. Click **"Record Audio"** or **"Record Pronunciation"** button

**Recording Process**:
1. **Click "Start Recording"**:
   - Browser will prompt for microphone permission (if not already granted)
   - Recording begins immediately after permission granted
   - Visual indicator shows recording status (red dot, duration timer)

2. **Speak the pronunciation**:
   - Speak clearly into your microphone
   - Duration limit: 30 seconds maximum
   - Typical recording: 1-2 seconds for single word pronunciation

3. **Click "Stop Recording"**:
   - Recording stops
   - Preview playback appears with controls: **"Use This Recording"**, **"Re-record"**, or **"Cancel"**

4. **Preview and decide**:
   - **Play preview** to listen to your recording
   - **"Use This Recording"**: Save audio and associate with card
   - **"Re-record"**: Discard current recording and start over (no upload yet)
   - **"Cancel"**: Discard recording and return to card form (no audio added)

5. **Save card**:
   - Audio file is uploaded to Supabase Storage (MP3 format)
   - Audio URL is saved to card's `audio_url` field
   - Card displays audio indicator (play button) in table view

**Tips**:
- Keep recordings short (1-2 seconds for words, up to 30 seconds for phrases)
- Speak clearly and at normal pace
- Test microphone levels before recording
- Preview before saving to avoid re-recording

---

### For Students: Playing Pronunciation Audio

**During Study**:
1. Navigate to **Study Mode** or **Card Library**
2. View a card that has pronunciation audio available
3. **Audio button appears on sides with Tibetan text** (not on English-only sides)
4. Click the **play button** (audio icon)
5. Pronunciation audio plays automatically
6. Audio stops automatically when finished (no manual stop needed)

**Audio Button Placement**:
- **Appears**: On card sides containing Tibetan script (front and/or back)
- **Does NOT appear**: On card sides with only English text (prevents giving away answers)
- **Indicators**:
  - ✅ Audio available: Play button visible
  - ❌ No audio: No button displayed

**Playback Behavior**:
- Single click to play
- Audio plays through speakers/headphones
- Auto-stops when audio finishes
- Button returns to play state (ready to play again)
- Loading indicator shown while audio loads (<2 seconds)

---

## Admin Audio Management

### Replacing Existing Audio

1. Edit a card that has existing audio
2. View audio section showing current audio with **"Play"**, **"Replace"**, or **"Delete"** options
3. Click **"Replace Audio"** or **"Record New"**
4. Recording interface opens
5. Record new audio (same workflow as initial recording)
6. Old audio file is deleted from storage, new audio is uploaded and associated

### Deleting Audio

1. Edit a card that has existing audio
2. View audio section
3. Click **"Delete Audio"**
4. Confirmation dialog appears
5. Confirm deletion
6. Audio file is removed from storage, card's `audio_url` is set to NULL

---

## Technical Details

### Audio Format
- **Storage Format**: MP3
- **Bitrate**: 64-96 kbps (optimized for voice)
- **Duration**: Maximum 30 seconds
- **File Size**: Typically 10-50KB (for 1-2 second recordings)

### Browser Compatibility

**Recording (MediaRecorder API)**:
- ✅ Chrome 47+ (desktop/mobile)
- ✅ Firefox 25+ (desktop)
- ✅ Safari 14.1+ (desktop/mobile)
- ❌ Internet Explorer (not supported)

**Playback (HTML5 Audio)**:
- ✅ All modern browsers
- ✅ iOS Safari
- ✅ Android Chrome

### Storage

- **Location**: Supabase Storage bucket `card-audio`
- **Access**: Public read (for playback), Admin write (for upload/delete)
- **URL Format**: `https://[project].supabase.co/storage/v1/object/public/card-audio/[filename].mp3`

---

## Troubleshooting

### "Microphone access denied"
- **Solution**: Grant microphone permission in browser settings
- **Location**: Browser settings → Site permissions → Microphone

### "Recording failed" or "Cannot record audio"
- **Cause**: Browser doesn't support MediaRecorder API
- **Solution**: Use supported browser (Chrome, Firefox, Safari)

### "Audio file upload failed"
- **Cause**: Network error or storage quota exceeded
- **Solution**: Check internet connection, verify Supabase Storage quota

### "Audio won't play"
- **Cause**: Audio file not loaded or network error
- **Solution**: Check internet connection, verify audio URL is accessible
- **Error message**: "Unable to play audio" or "Audio not available"

### "Audio button doesn't appear"
- **Cause**: Card doesn't have audio, or viewing English-only side
- **Solution**: Audio button only appears on sides with Tibetan text

---

## Best Practices

### For Admins
1. **Keep recordings short**: 1-2 seconds for words, 5-10 seconds for phrases
2. **Speak clearly**: Enunciate Tibetan words properly
3. **Test before saving**: Always preview recordings before saving
4. **Manage storage**: Delete unused or poor-quality recordings
5. **Consistent quality**: Maintain consistent recording volume and pace

### For Students
1. **Use headphones**: Better audio quality for pronunciation learning
2. **Repeat playback**: Click play multiple times to hear pronunciation
3. **Listen before answering**: Play audio before revealing answer
4. **Report issues**: Contact admin if audio doesn't play or sounds wrong

---

## Next Steps

- See [spec.md](./spec.md) for complete feature specification
- See [plan.md](./plan.md) for technical implementation details
- See [data-model.md](./data-model.md) for database schema

