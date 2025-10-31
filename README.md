# Tibetan Flashcard App

A web-based flashcard application for learning Tibetan, featuring spaced repetition (Anki-style SM-2 algorithm).

## Features

- **Numbers (0-30)**: Learn Tibetan numerals and script
  - Tibetan numerals (༠, ༡, ༢, etc.)
  - Tibetan script spelling
  - Filter by "First 10" (0-9) for focused practice
- **Words**: Learn basic Tibetan vocabulary
  - English ↔ Tibetan (both directions)
- **Spaced Repetition**: Cards you get right appear less frequently
- **Progress Tracking**: Monitor your learning progress
- **Card Management**: Add, edit, and delete cards
- **Filtering**: Study specific card types (Numerals, Numbers, Words, First 10)

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

## Tech Stack

- React 19
- Vite
- LocalStorage for data persistence
- SM-2 Algorithm for spaced repetition

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options (Vercel, Netlify, etc.)
