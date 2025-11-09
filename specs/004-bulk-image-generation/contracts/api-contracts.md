# API Contracts: Bulk Image Generation

**Feature**: 004-bulk-image-generation  
**Date**: 2025-11-09

## Overview

Bulk image generation reuses existing API endpoints. No new API endpoints are required. This document describes how existing endpoints are used for bulk operations.

## Existing Endpoints Used

### POST /api/generate-image

**Purpose**: Generate AI image from text prompt (reused from feature 001-immediate-image-generation)

**Request**:
```json
{
  "prompt": "string (required)",
  "style": "string (optional)"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "imageUrl": "string",
  "provider": "string"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "string"
}
```

**Usage in Bulk Generation**:
- Called sequentially for each card
- Prompt derived from card's text field (englishText, backEnglish, or front)
- Rate limiting handled client-side (200ms delay between calls)
- Errors handled gracefully (card added to failures list, processing continues)

**Rate Limiting**:
- Client-side: 200ms delay between requests
- Server-side: Existing rate limiting applies (if any)
- On rate limit error: Retry with exponential backoff (future enhancement)

### Card Update (via cardsService.saveCard)

**Purpose**: Save generated image URL to card (existing service method)

**Method**: `saveCard(card, fallbackSave)`

**Parameters**:
- `card`: Card object with updated `imageUrl`
- `fallbackSave`: Fallback function for localStorage (if Supabase not configured)

**Returns**: `Promise<{success: boolean, data?: Card, error?: string}>`

**Usage in Bulk Generation**:
- Called after each successful image generation
- Updates card's `imageUrl` field
- Card saved immediately (not batched)
- Errors handled gracefully (card added to failures list)

## No New Endpoints Required

**Rationale**:
- Bulk generation is client-side operation
- Existing image generation API supports individual requests
- Card updates use existing service methods
- No server-side job queue needed for expected scale (10-1000 cards)
- Client-side sequential processing sufficient and simpler

**Future Considerations** (Out of Scope):
- Server-side bulk API endpoint (if scale increases significantly)
- Job queue system (if operations become too long for client-side)
- Batch image generation API (if API provider supports it)

## Error Handling Contract

**Individual Card Failures**:
- Image generation failure: Continue with next card, record failure
- Card save failure: Continue with next card, record failure
- Network error: Retry once, then record failure and continue

**Bulk Operation Failures**:
- Rate limit error: Pause and retry with backoff (future enhancement)
- Complete operation failure: Show error message, allow retry

**Error Response Format**:
```json
{
  "cardId": "string",
  "cardText": "string",
  "error": "string",
  "timestamp": "ISO 8601 date string"
}
```

## Performance Contract

**Expected Performance** (from Success Criteria):
- Processing rate: 10+ cards per minute
- Progress update latency: < 2 seconds per card
- Completion summary: < 5 seconds after last card
- Cancellation response: < 3 seconds

**Actual Performance** (implementation dependent):
- Sequential processing with 200ms delay = ~5 cards/second theoretical max
- Accounting for API response time (~2-5 seconds per image generation)
- Expected: 10-20 cards per minute (meets success criteria)

