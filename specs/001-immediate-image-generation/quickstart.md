# Quickstart: Immediate Image Generation in Add Card Form

**Feature**: 001-immediate-image-generation  
**Date**: 2025-11-09  
**Phase**: 1 - Design & Contracts

## Overview

This feature adds image generation capabilities to the Add Card form, allowing admins to generate, search, or upload images immediately when creating cards, without needing to save and reopen. It also adds visible loading indicators during image operations.

## Prerequisites

- React 19.2.0+
- Existing image generation APIs configured (`/api/generate-image`, `/api/search-image`, `/api/upload-image`)
- Supabase Storage configured for image uploads
- Admin authentication working (`useAuth` hook)

## Implementation Steps

### 1. Update AdminCardModal to Pass isAdmin Prop

**File**: `src/components/AdminCardModal.jsx`

**Change**: Pass `isAdmin` prop to `AddCardForm` component

```jsx
{mode === 'add' && (
  <AddCardForm
    onAdd={onSave}
    onCancel={onCancel}
    isAdmin={isAdmin}  // ADD THIS LINE
  />
)}
```

---

### 2. Add Image State Management to AddCardForm

**File**: `src/components/AddCardForm.jsx`

**Add imports**:
```jsx
import { generateAIImage, searchImage, uploadImage, validateImageFile, createImagePreview, revokeImagePreview } from '../utils/images.js';
import { uploadImage as uploadToSupabase } from '../services/imagesService.js';
```

**Add state variables** (after existing state):
```jsx
const [imageUrl, setImageUrl] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [generating, setGenerating] = useState(false);
const [searching, setSearching] = useState(false);
const [uploading, setUploading] = useState(false);
```

**Add isAdmin prop** (update component signature):
```jsx
export default function AddCardForm({ onAdd, onCancel, isAdmin = false }) {
```

---

### 3. Add Image Generation Handlers

**File**: `src/components/AddCardForm.jsx`

**Add handler functions** (after `handleAudioRecorded`):

```jsx
const handleGenerateAIImage = async () => {
  const prompt = formData.backEnglish || formData.front || formData.englishText;
  if (!prompt?.trim()) {
    setError('Please enter text first');
    return;
  }

  setGenerating(true);
  setError('');

  try {
    const result = await generateAIImage(prompt.trim());
    
    if (result.success && result.imageUrl) {
      // Handle base64 data URL - upload to Supabase Storage
      if (result.imageUrl.startsWith('data:image/')) {
        try {
          const response = await fetch(result.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `${prompt}_${Date.now()}.png`, {
            type: blob.type || 'image/png'
          });
          const uploadResult = await uploadToSupabase(file);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            setImageUrl(uploadResult.imageUrl);
            setImagePreview(uploadResult.imageUrl);
          } else {
            setImageUrl(result.imageUrl);
            setImagePreview(result.imageUrl);
          }
        } catch (uploadErr) {
          console.error('Error uploading generated image:', uploadErr);
          setImageUrl(result.imageUrl);
          setImagePreview(result.imageUrl);
        }
      } else {
        setImageUrl(result.imageUrl);
        setImagePreview(result.imageUrl);
      }
    } else {
      setError(result.error || 'AI image generation failed');
    }
  } catch (err) {
    console.error('Image generation error:', err);
    setError('Image generation failed. Please try again.');
  } finally {
    setGenerating(false);
  }
};

const handleSearchUnsplash = async () => {
  const query = formData.backEnglish || formData.front || formData.englishText;
  if (!query?.trim()) {
    setError('Please enter text first');
    return;
  }

  setSearching(true);
  setError('');

  try {
    const result = await searchImage(query.trim());
    if (result.success && result.imageUrl) {
      setImageUrl(result.imageUrl);
      setImagePreview(result.imageUrl);
    } else {
      setError(result.error || 'Image search failed');
    }
  } catch (err) {
    console.error('Image search error:', err);
    setError('Image search failed. Please try again.');
  } finally {
    setSearching(false);
  }
};

const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const validation = validateImageFile(file);
  if (!validation.valid) {
    setError(validation.error || 'Invalid image file');
    return;
  }

  setUploading(true);
  setError('');

  const preview = createImagePreview(file);
  setImagePreview(preview);

  try {
    const result = await uploadImage(file);
    if (result.success && result.imageUrl) {
      setImageUrl(result.imageUrl);
      revokeImagePreview(preview);
      setImagePreview(result.imageUrl);
    } else {
      setError(result.error || 'Image upload failed');
      revokeImagePreview(preview);
      setImagePreview(null);
    }
  } catch (err) {
    console.error('Image upload error:', err);
    setError('Image upload failed. Please try again.');
    revokeImagePreview(preview);
    setImagePreview(null);
  } finally {
    setUploading(false);
  }
};

const handleRemoveImage = () => {
  if (imagePreview && imagePreview.startsWith('blob:')) {
    revokeImagePreview(imagePreview);
  }
  setImageUrl(null);
  setImagePreview(null);
};
```

---

### 4. Update Form Submission to Include Image URL

**File**: `src/components/AddCardForm.jsx`

**Update `handleSubmit` function** (add `imageUrl` to card creation):

```jsx
const newCard = createCard({
  ...formData,
  // ... existing fields ...
  imageUrl: imageUrl || null,  // ADD THIS LINE
  // ... rest of fields ...
});
```

**Update form reset** (add image state reset):
```jsx
setImageUrl(null);
setImagePreview(null);
```

---

### 5. Add Image Section to Form JSX

**File**: `src/components/AddCardForm.jsx`

**Add image section** (before audio recorder section):

```jsx
{/* Image Section */}
<div className="image-section">
  <label>Image (Optional)</label>
  
  <div className="image-actions">
    {isAdmin && (
      <>
        <button
          type="button"
          onClick={handleGenerateAIImage}
          disabled={generating || searching || uploading || (!formData.front?.trim() && !formData.backEnglish?.trim() && !formData.englishText?.trim())}
          className="btn-secondary"
          aria-busy={generating}
        >
          {generating ? (
            <>
              <span className="loading-spinner" aria-label="Generating image..."></span>
              Generating...
            </>
          ) : (
            'Generate AI Image'
          )}
        </button>
        
        <button
          type="button"
          onClick={handleSearchUnsplash}
          disabled={generating || searching || uploading || (!formData.front?.trim() && !formData.backEnglish?.trim() && !formData.englishText?.trim())}
          className="btn-secondary"
          aria-busy={searching}
        >
          {searching ? (
            <>
              <span className="loading-spinner" aria-label="Searching for image..."></span>
              Searching...
            </>
          ) : (
            'Search Unsplash'
          )}
        </button>
      </>
    )}
    
    <label className="btn-secondary btn-upload">
      {uploading ? (
        <>
          <span className="loading-spinner" aria-label="Uploading image..."></span>
          Uploading...
        </>
      ) : (
        'Upload Image'
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading || generating || searching}
        style={{ display: 'none' }}
      />
    </label>
    
    {imagePreview && (
      <button
        type="button"
        onClick={handleRemoveImage}
        className="btn-secondary btn-remove"
      >
        Remove Image
      </button>
    )}
  </div>

  {imagePreview && (
    <div className="image-preview">
      <img src={imagePreview} alt="Preview" />
    </div>
  )}
</div>
```

---

### 6. Add Loading Spinner CSS

**File**: `src/components/AddCardForm.css`

**Add styles** (at end of file):

```css
/* Image Section */
.image-section {
  margin-bottom: 1.5rem;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.image-preview {
  margin-top: 1rem;
  border: 1px solid var(--theme-border-dark);
  border-radius: 6px;
  padding: 0.5rem;
  background: var(--theme-bg-card);
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--theme-border-dark);
  border-top-color: var(--theme-accent-info);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    border-top-color: var(--theme-accent-info);
  }
}

/* Button states during loading */
button[aria-busy="true"] {
  opacity: 0.7;
  cursor: wait;
}
```

---

## Testing Checklist

- [ ] Image generation button visible for admin users
- [ ] Image generation button disabled when no text entered
- [ ] Loading spinner appears immediately on button click
- [ ] Loading spinner persists until operation completes
- [ ] Image preview displays after successful generation
- [ ] Image URL saved with card on form submission
- [ ] Error messages display on failure
- [ ] Remove image button works correctly
- [ ] Form reset clears image state
- [ ] Non-admin users only see upload button
- [ ] Accessibility: Screen reader announces loading state
- [ ] Accessibility: Keyboard navigation works
- [ ] E2E test: Complete card creation with image flow

## Common Issues

**Issue**: Loading spinner not visible  
**Solution**: Check CSS animation and ensure `loading-spinner` class is applied

**Issue**: Image not saving with card  
**Solution**: Verify `imageUrl` is included in `createCard()` call

**Issue**: Admin buttons not showing  
**Solution**: Verify `isAdmin` prop is passed from `AdminCardModal` to `AddCardForm`

**Issue**: Memory leak from blob URLs  
**Solution**: Ensure `revokeImagePreview()` is called when removing images or resetting form

## Next Steps

After implementation:
1. Write component tests for image generation features
2. Write integration tests for admin workflow
3. Write E2E tests for complete flow
4. Update documentation if needed

