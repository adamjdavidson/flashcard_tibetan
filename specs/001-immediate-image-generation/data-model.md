# Data Model: Immediate Image Generation in Add Card Form

**Feature**: 001-immediate-image-generation  
**Date**: 2025-11-09  
**Phase**: 1 - Design & Contracts

## Entities

### Card

**Description**: Represents a flashcard with optional image URL attribute that can be set during creation.

**Fields**:
- `imageUrl` (string | null): URL reference to the card's associated image
  - Optional field
  - Can be external URL (from Unsplash) or uploaded file URL (from Supabase Storage)
  - Set during card creation in AddCardForm
  - Persisted with card data

**Relationships**:
- One Card can have zero or one Image (via imageUrl)
- Image URL references external storage (Supabase Storage) or external service (Unsplash)

**Validation Rules**:
- `imageUrl` is optional (can be null)
- If provided, must be a valid URL string
- No validation on URL format (handled by image utilities)

**State Transitions**:
- Initial state: `imageUrl = null` (no image)
- After generation/search/upload: `imageUrl = <generated URL>`
- After removal: `imageUrl = null`
- On form cancel: `imageUrl` discarded (not saved)

---

### Image (Implicit Entity)

**Description**: Represents an image associated with a card, stored as a URL reference.

**Fields**:
- `url` (string): The image URL (stored in Card.imageUrl)
- `preview` (string | null): Temporary preview URL for display (blob URL or actual URL)
- `source` (string): Origin of image - "generated" | "unsplash" | "uploaded"

**Relationships**:
- Referenced by Card via imageUrl field
- Stored externally (Supabase Storage for uploads, Unsplash for searches, API response for generated)

**Validation Rules**:
- URL must be valid string
- Preview URL is temporary (blob URLs must be revoked)
- File uploads validated before processing (type, size)

**State Transitions**:
- Generation/Search/Upload initiated: Preview created, source set
- Operation completes: URL assigned, preview updated
- Operation fails: Error state, no URL assigned
- Image removed: URL and preview cleared

---

## Component State Model

### AddCardForm Image State

**State Variables**:
- `imageUrl` (string | null): Final image URL to save with card
- `imagePreview` (string | null): Preview URL for display (blob URL or actual URL)
- `generating` (boolean): AI image generation in progress
- `searching` (boolean): Unsplash search in progress
- `uploading` (boolean): Image upload in progress
- `error` (string): Error message if operation fails

**State Transitions**:
```
Initial: { imageUrl: null, imagePreview: null, generating: false, searching: false, uploading: false, error: '' }

Generate Clicked:
  → { generating: true, error: '' }
  → API call
  → Success: { generating: false, imageUrl: <url>, imagePreview: <url> }
  → Failure: { generating: false, error: <message> }

Search Clicked:
  → { searching: true, error: '' }
  → API call
  → Success: { searching: false, imageUrl: <url>, imagePreview: <url> }
  → Failure: { searching: false, error: <message> }

Upload Selected:
  → { uploading: true, error: '' }
  → File validation
  → Upload API call
  → Success: { uploading: false, imageUrl: <url>, imagePreview: <url> }
  → Failure: { uploading: false, error: <message> }

Remove Clicked:
  → { imageUrl: null, imagePreview: null }

Form Submit:
  → imageUrl included in card data
  → State reset on success
```

---

## Data Flow

### Image Generation Flow

1. User clicks "Generate AI Image"
2. Component sets `generating = true`, shows loading indicator
3. Component calls `generateAIImage(prompt)` utility
4. Utility calls `/api/generate-image` endpoint
5. API returns image URL (base64 or external URL)
6. If base64, component uploads to Supabase Storage
7. Component sets `imageUrl` and `imagePreview`
8. Component sets `generating = false`, hides loading indicator
9. On form submit, `imageUrl` included in card data

### Image Search Flow

1. User clicks "Search Unsplash"
2. Component sets `searching = true`, shows loading indicator
3. Component calls `searchImage(query)` utility
4. Utility calls `/api/search-image` endpoint
5. API returns Unsplash image URL
6. Component sets `imageUrl` and `imagePreview`
7. Component sets `searching = false`, hides loading indicator
8. On form submit, `imageUrl` included in card data

### Image Upload Flow

1. User clicks "Upload Image" and selects file
2. Component validates file (type, size)
3. Component sets `uploading = true`, shows loading indicator
4. Component creates preview blob URL
5. Component calls `uploadImage(file)` utility
6. Utility calls `/api/upload-image` endpoint
7. API uploads to Supabase Storage, returns URL
8. Component revokes blob URL, sets `imageUrl` and `imagePreview`
9. Component sets `uploading = false`, hides loading indicator
10. On form submit, `imageUrl` included in card data

---

## Validation Rules

### Image File Validation

- **File Type**: Must be image/jpeg, image/jpg, image/png, image/gif, or image/webp
- **File Size**: Maximum 5MB
- **Validation Location**: `validateImageFile()` utility function
- **Error Handling**: Returns `{ valid: false, error: string }` on failure

### Image URL Validation

- **Format**: Must be valid URL string
- **Validation Location**: Browser URL constructor (implicit)
- **Error Handling**: API errors handled by image utilities

---

## Constraints

- Only one image operation can be active at a time (generating, searching, or uploading)
- Image preview blob URLs must be revoked to prevent memory leaks
- Image URL is optional - card can be created without image
- Admin-only features (Generate AI Image, Search Unsplash) require `isAdmin` prop

