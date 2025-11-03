# Data Model: Audio Pronunciation for Cards

**Created**: 2025-11-03  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Entities

### Card (Enhanced)

**Description**: Represents a flashcard with front/back content. Enhanced with optional audio pronunciation URL.

**Attributes** (existing + new):
- `id` (TEXT, PRIMARY KEY) - Unique card identifier
- `type` (TEXT, NOT NULL) - Card type: 'number', 'word', 'phrase'
- `front` (TEXT, NOT NULL) - Front content (Tibetan script)
- `back_arabic` (TEXT, NULL) - Arabic numeral (for number cards)
- `back_english` (TEXT, NULL) - English translation (for word/phrase cards)
- `back_tibetan_script` (TEXT, NULL) - Tibetan script (for word/phrase cards)
- `back_tibetan_numeral` (TEXT, NULL) - Tibetan numeral (for number cards)
- `back_tibetan_spelling` (TEXT, NULL) - Romanized spelling (Wylie/phonetic) - optional for all types
- `tags` (TEXT[], DEFAULT '{}') - Legacy tags array (for backward compatibility)
- `subcategory` (TEXT, NULL) - Subcategory (e.g., 'numerals', 'script', 'english_to_tibetan')
- `notes` (TEXT, NULL) - Optional notes
- `image_url` (TEXT, NULL) - Optional image URL (existing)
- `audio_url` (TEXT, NULL) - **NEW** Optional audio pronunciation URL (Supabase Storage public URL)
- `instruction_level_id` (UUID, NULL, FK) - References instruction_levels.id (existing, from feature 001)
- `user_id` (UUID, NULL, FK) - References auth.users.id (existing)
- `is_master` (BOOLEAN, DEFAULT false) - Whether card is in master library (existing)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp

**Relationships**:
- One-to-one with Audio Recording (via `audio_url` field pointing to Supabase Storage file)
- Audio files stored in Supabase Storage bucket `card-audio`

**Validation Rules**:
- `audio_url` can be NULL (cards without audio)
- If `audio_url` is set, must be valid HTTPS URL (starts with `https://`)
- `audio_url` should reference Supabase Storage bucket (format: `https://[project].supabase.co/storage/v1/object/public/card-audio/[filename].mp3`)
- Audio file must be MP3 format (64-96 kbps, max 30 seconds duration)
- Card validation should verify audio URL is accessible (optional async validation)

**State Transitions**:
- **No audio → Has audio**: Admin records audio, uploads to storage, `audio_url` set to public URL
- **Has audio → No audio**: Admin deletes audio, file removed from storage, `audio_url` set to NULL
- **Has audio → New audio**: Admin replaces audio, old file deleted from storage, new file uploaded, `audio_url` updated

---

### Audio Recording (Storage Entity)

**Description**: Represents a pronunciation audio file stored in Supabase Storage, referenced by card's `audio_url` field.

**Storage Location**: Supabase Storage bucket `card-audio`

**File Format**: MP3 (64-96 kbps, mono or stereo, max 30 seconds duration)

**File Naming**: Timestamped with random suffix (e.g., `1701234567890_abc123def.mp3`)

**Attributes** (implicit, stored as file metadata):
- `filename` (TEXT) - File name in storage bucket
- `file_size` (INTEGER, bytes) - File size (typically 10-50KB for 1-2 second recordings)
- `content_type` (TEXT) - `audio/mpeg` for MP3 files
- `created_at` (TIMESTAMPTZ) - Upload timestamp (from Supabase Storage metadata)
- `bucket` (TEXT) - Always `card-audio`

**Relationships**:
- One-to-one with Card (card's `audio_url` points to this file)
- Referenced by card's `audio_url` field

**Validation Rules**:
- File must be MP3 format (`audio/mpeg`)
- File size typically 10-50KB (for 1-2 second recordings at 64-96 kbps)
- Maximum file size: ~200KB (for 30-second recordings at 64 kbps)
- File must be accessible via public URL (Supabase Storage public access)

**Lifecycle**:
1. **Creation**: Admin records audio → Convert to MP3 → Upload to `card-audio` bucket → Generate public URL → Store URL in card's `audio_url`
2. **Replacement**: Admin replaces audio → Delete old file from storage → Upload new file → Update card's `audio_url`
3. **Deletion**: Admin deletes audio → Delete file from storage → Set card's `audio_url` to NULL

---

## Database Migration

### Migration: Add audio_url column to cards table

**File**: `supabase/migrations/YYYYMMDDHHMMSS_add_audio_url_to_cards.sql`

```sql
-- Add audio_url column to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS audio_url TEXT NULL;

-- Optional: Add index for filtering cards with audio
CREATE INDEX IF NOT EXISTS idx_cards_audio_url 
ON cards(audio_url) 
WHERE audio_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN cards.audio_url IS 'Optional URL to pronunciation audio file in Supabase Storage (card-audio bucket). MP3 format, 64-96 kbps, max 30 seconds.';
```

**Backward Compatibility**:
- Existing cards have `audio_url = NULL` (no migration of existing data needed)
- Cards without audio continue to work normally
- Audio field is optional, so no breaking changes

---

## Supabase Storage Bucket

### Bucket: card-audio

**Purpose**: Store pronunciation audio files (MP3 format)

**Configuration**:
- **Name**: `card-audio`
- **Public**: Yes (read access for all authenticated users)
- **File size limit**: 200KB per file (covers 30-second recordings at 64 kbps)
- **Allowed MIME types**: `audio/mpeg` (MP3)
- **Cache control**: 3600 seconds (1 hour)

**Storage Policies**:
- **Public read**: All authenticated users can read audio files (for playback)
- **Admin write**: Only admin users can upload/delete audio files (enforced via Supabase Storage policies)

**Access Pattern**:
```javascript
// Upload
supabase.storage.from('card-audio').upload(filename, mp3Blob);

// Get public URL
supabase.storage.from('card-audio').getPublicUrl(filename);

// Delete
supabase.storage.from('card-audio').remove([filename]);
```

---

## Data Transformation

### Database Format → App Format

When loading cards from Supabase, transform `audio_url` to app format:

```javascript
{
  // ... existing card fields ...
  audioUrl: card.audio_url || null  // snake_case → camelCase
}
```

### App Format → Database Format

When saving cards to Supabase, transform `audioUrl` to database format:

```javascript
{
  // ... existing card fields ...
  audio_url: card.audioUrl || null  // camelCase → snake_case
}
```

**Note**: Similar to existing `image_url` transformation pattern in `cardsService.js`.

---

## Validation

### Client-Side Validation (cardSchema.js)

Add to existing `validateCard` function:

```javascript
// Audio URL validation (if provided)
if (card.audioUrl) {
  // Must be valid HTTPS URL
  if (typeof card.audioUrl !== 'string' || !card.audioUrl.startsWith('https://')) {
    return false;
  }
  
  // Should reference Supabase Storage card-audio bucket (optional validation)
  if (!card.audioUrl.includes('/storage/v1/object/public/card-audio/')) {
    console.warn('Audio URL does not appear to be from card-audio bucket');
  }
}
```

### Async Validation (optional)

Could add async validation to verify audio file exists and is accessible:

```javascript
async function validateAudioUrl(audioUrl) {
  try {
    const response = await fetch(audioUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## Summary

| Entity | Type | Key Field | Notes |
|--------|------|-----------|-------|
| **Card** | Table | `audio_url` (TEXT, NULL) | Optional audio URL field, backward compatible |
| **Audio Recording** | Storage File | Filename in `card-audio` bucket | MP3 format, 10-50KB typical, 200KB max |

**Migration Strategy**:
1. Add `audio_url` column to `cards` table (NULL default, no data migration needed)
2. Create `card-audio` storage bucket in Supabase
3. Configure bucket policies (public read, admin write)
4. Update `cardsService.js` to handle `audio_url` in transformations
5. Update `cardSchema.js` to validate `audioUrl` field

**Backward Compatibility**: ✅ Fully backward compatible - existing cards have `audio_url = NULL`, feature is opt-in

