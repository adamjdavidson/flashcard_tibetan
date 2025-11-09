# Feature Specification: Immediate Image Generation in Add Card Form

**Feature Branch**: `001-immediate-image-generation`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "I want to add some features and correct some bugs. The first thing: when I 'ADD CARD' in the admin page, I have to save it and re-open it in order to see 'Generate Image'. I want 'generate image' available from the beginning. One other feature here. I want some kind of signal that it is generating the image. it just goes silent/invisible for a few seconds and it's hard to know if it's working."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Image When Adding New Card (Priority: P1)

As an admin user, when I click "Add Card" in the admin page, I want to see image generation options (Generate AI Image, Search Unsplash, Upload Image) immediately available in the form, so I can add an image to the card before saving it, without having to save and reopen the card in edit mode.

**Why this priority**: This is the core bug fix that eliminates unnecessary workflow friction. Currently, admins must save a card, then reopen it to add images, which doubles the number of steps required. Making image generation available immediately streamlines the card creation process.

**Independent Test**: Can be fully tested by opening the Add Card form and verifying that all image generation buttons are visible and functional for admin users. This delivers immediate value by allowing image addition during initial card creation.

**Acceptance Scenarios**:

1. **Given** I am an admin user on the admin page, **When** I click "Add Card" to open the add card form, **Then** I see an "Image (Optional)" section with buttons for "Generate AI Image", "Search Unsplash", and "Upload Image" available immediately
2. **Given** I have opened the Add Card form and entered text in the front, backEnglish, or englishText field, **When** I click "Generate AI Image", **Then** an AI-generated image is created and displayed in the form preview, and the image is included when I save the card
3. **Given** I have opened the Add Card form and entered text in the front, backEnglish, or englishText field, **When** I click "Search Unsplash", **Then** an image from Unsplash is found and displayed in the form preview, and the image is included when I save the card
4. **Given** I have opened the Add Card form, **When** I click "Upload Image" and select an image file, **Then** the image is uploaded and displayed in the form preview, and the image is included when I save the card
5. **Given** I have added an image to the Add Card form, **When** I click "Remove Image", **Then** the image is removed from the preview and will not be saved with the card
6. **Given** I am a non-admin user, **When** I open the Add Card form, **Then** I see only the "Upload Image" button (Generate AI Image and Search Unsplash are not visible)
7. **Given** I have opened the Add Card form but have not entered any text in front, backEnglish, or englishText fields, **When** I view the image generation buttons, **Then** the "Generate AI Image" and "Search Unsplash" buttons are disabled

---

### User Story 2 - Visual Feedback During Image Generation (Priority: P1)

As an admin user, when I click "Generate AI Image", "Search Unsplash", or "Upload Image", I want to see clear visual feedback (such as a loading spinner, progress indicator, or animated element) that shows the operation is in progress, so I know the system is working and haven't accidentally clicked multiple times or think the system is frozen.

**Why this priority**: This addresses a critical UX issue where users cannot tell if image generation is working. Without visible feedback, users may think the system is broken, click multiple times, or abandon the operation. Clear visual feedback improves user confidence and prevents confusion during the 3-10 second generation period.

**Independent Test**: Can be fully tested by clicking any image operation button and verifying that a visible loading indicator appears immediately and remains visible until the operation completes. This delivers immediate value by providing user confidence and preventing duplicate requests.

**Acceptance Scenarios**:

1. **Given** I have clicked "Generate AI Image" in the Add Card form, **When** the image generation starts, **Then** I immediately see a visible loading indicator (spinner, progress bar, or animated element) that persists until generation completes or fails
2. **Given** I have clicked "Search Unsplash" in the Add Card form, **When** the search starts, **Then** I immediately see a visible loading indicator that persists until search completes or fails
3. **Given** I have clicked "Upload Image" and selected a file, **When** the upload starts, **Then** I immediately see a visible loading indicator that persists until upload completes or fails
4. **Given** an image operation is in progress, **When** I view the image section, **Then** the loading indicator is clearly visible and distinguishable from other UI elements
5. **Given** an image operation completes successfully, **When** the result is displayed, **Then** the loading indicator disappears and is replaced by the image preview
6. **Given** an image operation fails, **When** an error occurs, **Then** the loading indicator disappears and an error message is displayed

---

### Edge Cases

- What happens when image generation fails (network error, API error)? System displays an error message and allows user to retry or use alternative methods
- What happens when Unsplash search returns no results? System displays an appropriate message and allows user to try different search terms or use alternative methods
- How does system handle image upload failures? System displays an error message and allows user to retry or select a different file
- What happens when user generates an image but then changes the card text before saving? The generated image remains associated with the card (user can regenerate if desired)
- How does system handle very large image files? System validates file size and displays error if file exceeds limits
- What happens when user adds an image but then cancels the form? Image is discarded and not saved
- How does system handle concurrent image operations? Only one image operation (generate/search/upload) can be active at a time, with appropriate loading states
- What happens if user clicks image generation button multiple times? System prevents duplicate requests by disabling buttons and showing loading indicator
- How does system handle very long image generation times (30+ seconds)? Loading indicator remains visible and may show additional messaging about extended wait times

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an "Image (Optional)" section in the Add Card form with image management capabilities
- **FR-002**: System MUST show "Generate AI Image" button in Add Card form for admin users when at least one text field (front, backEnglish, or englishText) contains text
- **FR-003**: System MUST show "Search Unsplash" button in Add Card form for admin users when at least one text field (front, backEnglish, or englishText) contains text
- **FR-004**: System MUST show "Upload Image" button in Add Card form for all users
- **FR-005**: System MUST display image preview in Add Card form when an image is selected/generated/uploaded
- **FR-006**: System MUST include "Remove Image" button when an image preview is displayed
- **FR-007**: System MUST save the image URL with the card when the Add Card form is submitted
- **FR-008**: System MUST disable "Generate AI Image" and "Search Unsplash" buttons when no text is available in front, backEnglish, or englishText fields
- **FR-009**: System MUST only display "Generate AI Image" and "Search Unsplash" buttons to admin users
- **FR-010**: System MUST display loading states ("Generating...", "Searching...", "Uploading...") during image operations
- **FR-011**: System MUST display error messages when image operations fail
- **FR-012**: System MUST allow users to remove an image before saving the card
- **FR-013**: System MUST handle image upload validation (file type, size) before processing
- **FR-014**: System MUST display a visible loading indicator (spinner, progress animation, or similar visual element) immediately when image generation starts
- **FR-015**: System MUST display a visible loading indicator immediately when Unsplash search starts
- **FR-016**: System MUST display a visible loading indicator immediately when image upload starts
- **FR-017**: System MUST keep the loading indicator visible throughout the entire image operation duration
- **FR-018**: System MUST remove the loading indicator when the image operation completes (success or failure)
- **FR-019**: System MUST make the loading indicator clearly distinguishable from other UI elements (sufficient size, color contrast, animation)
- **FR-020**: System MUST disable image operation buttons while their respective loading indicators are active to prevent duplicate requests

### Key Entities *(include if feature involves data)*

- **Card**: Represents a flashcard with optional image URL attribute that can be set during creation
- **Image**: Represents an image associated with a card, stored as a URL reference (either external URL or uploaded file URL)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can add an image to a new card in a single workflow (without saving and reopening) - 100% of image addition operations complete in the Add Card form
- **SC-002**: Image generation buttons are visible immediately when Add Card form opens for admin users - 0% of admin users need to save and reopen to access image generation
- **SC-003**: Image operations (generate, search, upload) complete successfully in Add Card form - 95% of image operations complete without errors
- **SC-004**: Cards created with images in Add Card form save correctly with image URLs - 100% of cards with images save with valid image URL references
- **SC-005**: Time to add a card with an image is reduced by eliminating the save-and-reopen step - card creation workflow takes 50% less time when adding images
- **SC-006**: Users can clearly see when image operations are in progress - 100% of image operations display visible loading indicators within 0.5 seconds of initiation
- **SC-007**: Users do not experience confusion about whether image generation is working - 0% of users report uncertainty about operation status during image generation
- **SC-008**: Loading indicators remain visible for the entire operation duration - loading indicators persist until completion or failure in 100% of operations

## Assumptions

- Image generation functionality already exists in EditCardForm and can be reused/adapted for AddCardForm
- Admin user detection mechanism is already in place and functional
- Image upload and storage infrastructure is already operational
- The same image generation APIs and services used in EditCardForm will be available for AddCardForm
- Image preview functionality and styling already exists and can be reused
- Form validation and submission logic can handle optional image URL field
