# Research: Audio Pronunciation for Cards

**Created**: 2025-11-03  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Research Questions

### Client-Side MP3 Conversion Library

**Question**: What library should be used for client-side MP3 conversion from MediaRecorder's native format?

**Decision**: Use `lamejs` (JavaScript MP3 encoder) for client-side conversion. Alternative: Consider server-side conversion via Vercel function if client-side conversion proves problematic.

**Rationale**:
- MediaRecorder API produces different formats per browser (WebM on Chrome/Firefox, AAC/MP4 on Safari)
- MP3 ensures universal playback compatibility (iOS, Android, all browsers)
- Client-side conversion reduces server load and latency
- `lamejs` is lightweight (~200KB minified), pure JavaScript, no WASM dependencies
- Works in all modern browsers including mobile Safari and Chrome

**Alternatives Considered**:
1. **Server-side conversion (FFmpeg via Vercel function)**: More reliable format conversion, handles all edge cases. Rejected due to increased latency, server load, and complexity (requires serverless function deployment).
2. **Accept multiple formats, convert on playback**: Store native format, convert in browser on demand. Rejected because it requires format detection and multiple codecs, increases bundle size.
3. **Use browser's native MediaRecorder with codec selection**: Try to force MP3 recording. Rejected because MediaRecorder API doesn't allow codec selection reliably across browsers, and MP3 recording isn't widely supported.

**Implementation Approach**:
- Use MediaRecorder API to record in browser's native format (WebM/AAC)
- Use `lamejs` to convert recorded audio to MP3 (64-96 kbps for voice) before upload
- Conversion happens in memory (Blob → WAV → MP3) before uploading to Supabase
- If conversion fails, fallback to server-side conversion or store native format with format metadata

**Library Details**:
- **Package**: `lamejs` (npm: `lamejs`)
- **Bundle Size**: ~200KB minified
- **License**: LGPL (compatible with MIT projects)
- **Browser Support**: All modern browsers (uses Web Audio API)
- **Usage Pattern**: 
  ```javascript
  // Record → Convert to WAV → Encode to MP3 → Upload
  const audioData = await mediaRecorder.record();
  const wavBuffer = convertToWAV(audioData); // Use Web Audio API
  const mp3Blob = lamejs.encode(wavBuffer, { bitrate: 64 });
  ```

---

### MediaRecorder API Browser Compatibility

**Question**: How should we handle MediaRecorder API differences across browsers (iOS Safari, Android Chrome, desktop browsers)?

**Decision**: Use MediaRecorder API with feature detection and graceful fallbacks. Provide clear error messages for unsupported browsers.

**Rationale**:
- MediaRecorder API support varies: Chrome/Firefox support WebM, Safari supports AAC/MP4
- iOS Safari 14.5+ supports MediaRecorder, Android Chrome 47+ supports it
- Desktop browsers have excellent support (Chrome 47+, Firefox 25+, Safari 14.1+)
- Need graceful fallback for older browsers (manual file upload option)

**Alternatives Considered**:
1. **Server-side recording only**: Force users to record via server API. Rejected because it requires always-on microphone connection, higher latency, more complex.
2. **Browser-specific recording libraries**: Use polyfills or abstraction libraries. Rejected because MediaRecorder API is standard and well-supported, adding abstractions adds complexity without clear benefit.

**Implementation Approach**:
- Feature detection: `if (navigator.mediaDevices && MediaRecorder)`
- Browser-specific handling:
  - Chrome/Firefox: Record as WebM, convert to MP3
  - Safari: Record as AAC/MP4, convert to MP3 (may require different conversion path)
  - Fallback: Manual file upload for unsupported browsers
- Error handling: Clear messages for microphone permission denial, unsupported browser
- Testing: Test on iOS Safari 14.5+, Android Chrome 47+, desktop Chrome/Firefox/Safari

---

### Supabase Storage Pattern for Audio

**Question**: How should audio files be organized in Supabase Storage? Bucket structure, naming, access policies?

**Decision**: Create dedicated `card-audio` bucket following existing `card-images` pattern. Use timestamped filenames with random suffix. Public read access, admin-only write access.

**Rationale**:
- Follows existing pattern (`card-images` bucket) for consistency
- Dedicated bucket allows separate access policies and storage quotas
- Timestamped filenames prevent collisions
- Public read access enables direct playback without authentication
- Admin-only write ensures security (FR-013)

**Alternatives Considered**:
1. **Single bucket with folders**: Store images and audio in same bucket with folder structure. Rejected because it complicates access policies and cleanup logic.
2. **Per-user buckets**: Separate buckets per admin user. Rejected because audio is shared (card-level, not user-level), and bucket management becomes complex.

**Implementation Approach**:
```javascript
// Similar to imagesService.js pattern
const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
const { error } = await supabase.storage
  .from('card-audio')
  .upload(fileName, mp3Blob, {
    cacheControl: '3600',
    upsert: false
  });
const { data: urlData } = supabase.storage
  .from('card-audio')
  .getPublicUrl(fileName);
```

**Storage Policies**:
- **Bucket**: `card-audio` (create via Supabase dashboard or migration)
- **RLS**: Not applicable (storage buckets don't use RLS, use bucket policies instead)
- **Bucket Policies**:
  - Public read: `SELECT` for all authenticated users
  - Admin write: `INSERT`, `UPDATE`, `DELETE` for admin role only
- **Cleanup**: Delete old audio files when card audio is replaced or deleted (FR-012)

---

### Audio Playback on Mobile Devices

**Question**: How should audio playback be implemented for optimal mobile compatibility?

**Decision**: Use HTML5 Audio API with `<audio>` element or Audio constructor. Ensure MP3 format for universal compatibility. Auto-stop on completion (FR-007).

**Rationale**:
- HTML5 Audio API is universally supported (iOS Safari, Android Chrome, desktop browsers)
- MP3 format ensures playback across all devices
- Simple play button (no pause/stop) aligns with spec (auto-stop on completion)
- No additional libraries needed for basic playback

**Alternatives Considered**:
1. **Web Audio API for advanced controls**: More control over playback, volume, effects. Rejected because it adds complexity without clear benefit (simple play button is sufficient).
2. **Third-party audio player libraries**: Libraries like Howler.js for better browser compatibility. Rejected because HTML5 Audio is sufficient for MP3 playback, and adding libraries increases bundle size.

**Implementation Approach**:
```javascript
// Simple audio playback component
const audio = new Audio(audioUrl);
audio.play(); // Auto-stops on completion (ended event)
audio.addEventListener('ended', () => {
  // Button returns to play state
});
```

**Mobile Considerations**:
- iOS requires user interaction to play audio (not autoplay) - this is fine since user clicks play button
- Android Chrome allows autoplay but user interaction preferred - clicking play button satisfies this
- Loading indicators required for network delays (FR-008)
- Error handling for network failures (FR-009)

---

### Recording Interface UX Patterns

**Question**: What UX patterns should the recording interface follow for optimal user experience?

**Decision**: Simple, clear recording interface with: Start/Stop buttons, recording indicator (duration timer or visual indicator), preview playback with controls (Play, Re-record, Cancel), file size display.

**Rationale**:
- Simple interface reduces cognitive load (SC-001: <3 clicks to record)
- Visual feedback during recording (duration) helps admins know recording length
- Preview playback lets admins verify recording quality before saving
- Re-record option prevents wasted uploads (FR-003)

**Alternatives Considered**:
1. **Auto-save on stop**: Save immediately when admin stops recording. Rejected because admins want to preview and possibly re-record before saving.
2. **Waveform visualization**: Real-time waveform during recording. Rejected because it adds complexity without clear benefit for simple pronunciation recordings (1-2 seconds).

**Implementation Approach**:
- Recording component state: `idle`, `recording`, `preview`, `uploading`
- Visual feedback:
  - Recording: Red indicator dot with duration timer (00:00 format)
  - Preview: Play button with re-record and cancel options
  - Uploading: Progress spinner or loading indicator
- Duration limit: Show warning at 25 seconds, auto-stop at 30 seconds (FR-016)

---

### Database Schema Extension

**Question**: How should audio URL be added to cards table? Migration strategy, backward compatibility?

**Decision**: Add `audio_url` column to `cards` table as optional TEXT field. Migration adds column with NULL default, existing cards unaffected.

**Rationale**:
- Optional field maintains backward compatibility (existing cards have NULL audio_url)
- TEXT field stores Supabase Storage public URL (similar to image_url pattern)
- Simple schema change, no complex migrations needed
- Can be indexed for filtering if needed (cards with audio)

**Alternatives Considered**:
1. **Separate audio_files table**: Normalize audio storage with separate table. Rejected because one-to-one relationship (one audio per card), adds complexity without benefit.
2. **JSON field for audio metadata**: Store URL plus metadata (duration, format, size). Rejected because current spec only requires URL, metadata can be added later if needed.

**Implementation Approach**:
```sql
-- Migration: Add audio_url column
ALTER TABLE cards 
ADD COLUMN audio_url TEXT NULL;

-- Optional: Add index for filtering cards with audio
CREATE INDEX IF NOT EXISTS idx_cards_audio_url 
ON cards(audio_url) 
WHERE audio_url IS NOT NULL;
```

**Validation Rules**:
- `audio_url` can be NULL (cards without audio)
- If `audio_url` is set, must be valid URL (starts with https://)
- Audio URL should reference Supabase Storage bucket (validation can be added in cardSchema.js)

---

## Summary of Decisions

| Decision Area | Choice | Rationale |
|--------------|--------|-----------|
| MP3 Conversion | `lamejs` client-side library | Universal compatibility, lightweight, no server load |
| Recording API | MediaRecorder API (browser native) | Standard API, well-supported, no dependencies |
| Storage Pattern | Dedicated `card-audio` bucket (similar to `card-images`) | Consistency, separate access policies, easier cleanup |
| Playback API | HTML5 Audio API (browser native) | Universal support, simple, no dependencies |
| Database Schema | Add optional `audio_url` TEXT column to `cards` table | Backward compatible, simple, follows existing patterns |
| Recording UX | Simple interface: Start/Stop → Preview → Use/Re-record/Cancel | <3 clicks, preview before save, reduces wasted uploads |

## Unresolved Questions

None - All technical decisions have been made with informed choices.

