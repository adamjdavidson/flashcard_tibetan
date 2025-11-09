# API Contracts: Image Generation Services

**Feature**: 001-immediate-image-generation  
**Date**: 2025-11-09  
**Phase**: 1 - Design & Contracts

## Overview

This feature uses three existing API endpoints for image operations:
1. `/api/generate-image` - AI image generation
2. `/api/search-image` - Unsplash image search
3. `/api/upload-image` - Supabase Storage upload

All endpoints are Vercel serverless functions. The frontend uses utility functions in `src/utils/images.js` that wrap these APIs.

---

## POST /api/generate-image

**Description**: Generates an AI image from a text prompt using configured image generation service (Gemini, DALL-E, or Stable Diffusion).

### Request

**Method**: `POST`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "prompt": "string (required)",
  "style": "string (optional)"
}
```

**Parameters**:
- `prompt` (string, required): Text description of the image to generate
- `style` (string, optional): Image style modifier

### Response

**Success (200 OK)**:
```json
{
  "imageUrl": "string",
  "provider": "string"
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Prompt is required"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Image generation API key not configured..."
}
```

### Example

**Request**:
```javascript
fetch('/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'apple',
    style: null
  })
})
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,iVBORw0KGgo...",
  "provider": "gemini"
}
```

---

## POST /api/search-image

**Description**: Searches for images on Unsplash based on a query string.

### Request

**Method**: `POST`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "query": "string (required)",
  "per_page": "number (optional, default: 1)"
}
```

**Parameters**:
- `query` (string, required): Search query for Unsplash
- `per_page` (number, optional): Number of results (max 10, default 1)

### Response

**Success (200 OK)**:
```json
{
  "imageUrl": "string",
  "attribution": "string | null",
  "provider": "string"
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Search query is required"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Unsplash API key not configured"
}
```

### Example

**Request**:
```javascript
fetch('/api/search-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'apple',
    per_page: 1
  })
})
```

**Response**:
```json
{
  "imageUrl": "https://images.unsplash.com/photo-...",
  "attribution": "Photo by John Doe on Unsplash",
  "provider": "unsplash"
}
```

---

## POST /api/upload-image

**Description**: Uploads an image file to Supabase Storage.

### Request

**Method**: `POST`  
**Content-Type**: `multipart/form-data` or `application/json`

**Form Data** (multipart):
- `image` (File, required): Image file to upload

**JSON Body** (base64):
```json
{
  "image": "string (required, base64 data URL)"
}
```

### Response

**Success (200 OK)**:
```json
{
  "imageUrl": "string"
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Image is required (base64 string)"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Supabase not configured"
}
```

### Example

**Request** (FormData):
```javascript
const formData = new FormData();
formData.append('image', file);

fetch('/api/upload-image', {
  method: 'POST',
  body: formData
})
```

**Response**:
```json
{
  "imageUrl": "https://[supabase-url]/storage/v1/object/public/card-images/..."
}
```

---

## Frontend Utility Functions

### generateAIImage(prompt, style?)

**Location**: `src/utils/images.js`

**Parameters**:
- `prompt` (string): Image generation prompt
- `style` (string, optional): Image style modifier

**Returns**: `Promise<{success: boolean, imageUrl?: string, provider?: string, error?: string}>`

**Example**:
```javascript
const result = await generateAIImage('apple');
if (result.success) {
  console.log(result.imageUrl); // "data:image/png;base64,..."
}
```

---

### searchImage(query)

**Location**: `src/utils/images.js`

**Parameters**:
- `query` (string): Search query

**Returns**: `Promise<{success: boolean, imageUrl?: string, attribution?: string, provider?: string, error?: string}>`

**Example**:
```javascript
const result = await searchImage('apple');
if (result.success) {
  console.log(result.imageUrl); // "https://images.unsplash.com/..."
}
```

---

### uploadImage(file)

**Location**: `src/utils/images.js`

**Parameters**:
- `file` (File): Image file to upload

**Returns**: `Promise<{success: boolean, imageUrl?: string, error?: string}>`

**Example**:
```javascript
const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadImage(file);
if (result.success) {
  console.log(result.imageUrl); // "https://[supabase-url]/..."
}
```

---

## Error Handling

All utility functions return consistent error format:
```typescript
{
  success: false,
  error: "Error message string"
}
```

Errors are handled at the component level:
- Display error message to user
- Allow retry or alternative methods
- Log errors for debugging

---

## Environment Variables

**Required**:
- `IMAGE_GENERATION_API_KEY` or `GEMINI_API_KEY`: API key for image generation service
- `IMAGE_GENERATION_SERVICE`: Service to use (`gemini`, `dalle`, `stable-diffusion`)
- `UNSPLASH_ACCESS_KEY`: Unsplash API access key (optional, falls back to AI generation)
- `VITE_SUPABASE_URL` or `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for uploads

---

## Rate Limits & Performance

- **Image Generation**: 3-10 seconds typical response time (API-dependent)
- **Unsplash Search**: < 1 second typical response time
- **Image Upload**: 1-3 seconds typical response time (file size dependent)

**Constraints**:
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP
- Image generation may have API rate limits (service-dependent)

