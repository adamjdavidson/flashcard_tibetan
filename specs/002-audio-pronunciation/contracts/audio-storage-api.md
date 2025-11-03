# API Contract: Audio Storage Operations

**Created**: 2025-11-03  
**Feature**: [spec.md](../spec.md)  
**Plan**: [plan.md](../plan.md)

## Overview

Audio storage operations use Supabase Storage directly (similar to image storage pattern). No serverless API endpoints required. All operations use Supabase client-side SDK.

**Base Path**: Supabase Storage (`supabase.storage.from('card-audio')`)

## Audio Upload

**Operation**: Upload MP3 audio file to Supabase Storage

**Supabase Storage API**:
```javascript
const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
const { error } = await supabase.storage
  .from('card-audio')
  .upload(fileName, mp3Blob, {
    cacheControl: '3600',
    upsert: false
  });
```

**Request**:
- **Method**: `PUT` (via Supabase Storage SDK)
- **Bucket**: `card-audio`
- **File**: MP3 Blob (64-96 kbps, max 30 seconds, 10-50KB typical)
- **Content-Type**: `audio/mpeg`

**Response**:
```typescript
{
  error: PostgrestError | null;  // null if successful
}
```

**Error Cases**:
- `StorageError` - File too large (>200KB), bucket doesn't exist, permission denied
- Network error - Connection failure during upload

**Success Flow**:
1. Get public URL: `supabase.storage.from('card-audio').getPublicUrl(fileName)`
2. Store URL in card's `audio_url` field
3. Update card in database with new `audio_url` value

---

## Audio URL Generation

**Operation**: Get public URL for uploaded audio file

**Supabase Storage API**:
```javascript
const { data: urlData } = supabase.storage
  .from('card-audio')
  .getPublicUrl(fileName);
```

**Response**:
```typescript
{
  data: {
    publicUrl: string;  // Full HTTPS URL to audio file
  };
}
```

**URL Format**: `https://[project].supabase.co/storage/v1/object/public/card-audio/[filename].mp3`

---

## Audio Deletion

**Operation**: Delete audio file from Supabase Storage

**Supabase Storage API**:
```javascript
const { error } = await supabase.storage
  .from('card-audio')
  .remove([fileName]);
```

**Request**:
- **Method**: `DELETE` (via Supabase Storage SDK)
- **Bucket**: `card-audio`
- **File**: Filename (extracted from `audio_url` or stored separately)

**Response**:
```typescript
{
  error: PostgrestError | null;  // null if successful
}
```

**Error Cases**:
- `StorageError` - File doesn't exist, permission denied, bucket doesn't exist
- Network error - Connection failure during deletion

**Success Flow**:
1. Delete file from storage
2. Set card's `audio_url` to NULL
3. Update card in database

---

## Storage Policies

### Bucket: card-audio

**Access Policies**:
- **Public Read**: All authenticated users can read audio files (for playback)
- **Admin Write**: Only admin users can upload/delete audio files

**Bucket Configuration**:
- **Name**: `card-audio`
- **Public**: Yes
- **File Size Limit**: 200KB per file
- **Allowed MIME Types**: `audio/mpeg` (MP3)

---

## Card Update with Audio

**Operation**: Update card's `audio_url` field in database

**Supabase Query**:
```javascript
const { error } = await supabase
  .from('cards')
  .update({ audio_url: audioUrl })
  .eq('id', cardId);
```

**Request**:
- **Table**: `cards`
- **Field**: `audio_url` (TEXT, NULL)
- **Value**: Supabase Storage public URL or NULL

**Response**:
```typescript
{
  error: PostgrestError | null;  // null if successful
}
```

**RLS Policy**: Only admins can update cards (existing policy)

---

## Audio Conversion (Client-Side)

**Operation**: Convert MediaRecorder output to MP3 format

**Implementation**: Client-side library (`lamejs` or similar)

**Process**:
1. **Record**: MediaRecorder API → Blob (WebM/AAC format)
2. **Convert to WAV**: Use Web Audio API to convert Blob to WAV buffer
3. **Encode to MP3**: Use `lamejs` library to encode WAV buffer to MP3 (64-96 kbps)
4. **Result**: MP3 Blob ready for upload

**No API Endpoint**: Conversion happens entirely in browser (no server request)

---

## Summary

| Operation | Method | Endpoint | Auth Required |
|-----------|--------|----------|---------------|
| Upload Audio | `PUT` | `supabase.storage.from('card-audio').upload()` | Admin |
| Get Public URL | `GET` | `supabase.storage.from('card-audio').getPublicUrl()` | None |
| Delete Audio | `DELETE` | `supabase.storage.from('card-audio').remove()` | Admin |
| Update Card Audio URL | `PATCH` | `supabase.from('cards').update()` | Admin |

**Note**: All operations use Supabase client-side SDK. No Vercel serverless functions required.

