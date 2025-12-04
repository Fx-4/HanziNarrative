# HanziNarrative Frontend

React + TypeScript + Vite frontend for the HanziNarrative application.

## Features

- Modern React with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation
- Axios for API calls

## Setup

See the main [SETUP.md](../SETUP.md) in the root directory for complete setup instructions.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx    # App layout wrapper
│   │   ├── Navbar.tsx    # Navigation bar
│   │   ├── HanziWordPopup.tsx  # Word definition popup
│   │   └── VocabularyCard.tsx  # Flashcard component
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Stories.tsx   # Story listing
│   │   ├── StoryReader.tsx  # Interactive story reader
│   │   ├── Vocabulary.tsx    # Flashcard review
│   │   ├── Login.tsx     # Login page
│   │   ├── Register.tsx  # Registration page
│   │   └── Profile.tsx   # User profile
│   ├── services/         # API services
│   │   └── api.ts        # API client and endpoints
│   ├── store/            # State management
│   │   └── authStore.ts  # Authentication state
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Type definitions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── index.html            # HTML template
```

## Key Features

### Interactive Story Reader

The `StoryReader` component allows users to:
- Read stories with clickable Chinese characters
- Click words to see popup with Pinyin, English, and images
- Track progress through stories

### Vocabulary Flashcards

The `Vocabulary` page provides:
- Flashcard-style review
- Filter by HSK level
- Click to flip cards and reveal meanings

### User Authentication

Implemented with JWT tokens:
- Login and registration forms
- Protected routes
- Persistent auth state with Zustand

## Styling

TailwindCSS is configured with custom utilities:
- `.hanzi-word` - Clickable word styling
- `.card` - Card container
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button

Chinese font: Noto Sans SC (loaded from Google Fonts)

## State Management

Using Zustand for lightweight state management:
- `authStore` - User authentication and session

## API Integration

All API calls are centralized in `src/services/api.ts`:
- Automatic JWT token injection
- Type-safe request/response handling
- Error handling

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `Navbar.tsx`

### Adding New API Endpoints

1. Define types in `src/types/index.ts`
2. Add API function in `src/services/api.ts`
3. Use in components

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory. Serve with any static file server.
