# StarLight Quran

A comprehensive Arabic-first Islamic web application built with Next.js 16 and React 19. StarLight Quran provides a complete Quran reader (Mushaf), Adhkar (daily remembrances), and Duas (supplications) with advanced features including verse-by-verse audio playback, tafsir (interpretation), favorites management, search functionality, font size controls, and verse image export.

## Features

- Full Quran reader with interactive verse cards
- Audio playback for verses with playback controls
- Tafsir (interpretation) display for each verse
- Adhkar (remembrances) with categorization
- Duas (supplications) collection
- Favorite surahs and verses with persistent storage
- Full-text search across Quran content
- Font size adjustment controls
- Verse image export to PNG format
- Light and dark mode with automatic persistence
- Responsive design with RTL layout support
- Advanced WebGL-based animated backgrounds
- Glassmorphism UI design
- Long-press context menu for verses
- Waqf stops guide

## Technology Stack

### Core Framework
- **Next.js 16** with App Router for modern React development
- **React 19** with TypeScript for type-safe components
- **TypeScript 5.9.3** for type safety

### Styling and Design
- **CSS Modules** for component-scoped styling
- **Tailwind CSS 4** via @tailwindcss/postcss for utility-first styling
- **CSS Custom Properties** for consistent theming

### Animation Libraries
- **GSAP 3.14.2** - GreenSock Animation Platform for DOM animations and micro-interactions
- **Framer Motion 12.23.25** - React animation library with AnimatePresence and motion components
- **OGL 1.0.11** - WebGL library for Aurora and Iridescence shader effects

### UI Components and Icons
- **Material-UI (MUI) 7.3.6** - Material Design component library
- **MUI Icons Material 7.3.6** - Material Design icons
- **Emotion React 11.14.0** - CSS-in-JS styling solution for MUI
- **Emotion Styled 11.14.1** - Styled components for Emotion

### Data and API Integration
- **@quranjs/api 2.1.0** - Quran.com API client for Quran text and tafsir
- **Day.js 1.11.19** - Lightweight date utility library

### Utilities
- **usehooks-ts 3.1.1** - Custom React hooks collection including debounce
- **html2canvas 1.4.1** - Client-side screenshot capture for verse images

### Performance and Analytics
- **@vercel/analytics 1.6.1** - Web analytics integration
- **@vercel/speed-insights 1.3.1** - Performance metrics tracking

### Development Tools
- **ESLint 9** - Code quality and linting
- **ESLint Config Next** - Next.js specific ESLint configuration

## Project Structure

```
/app
  - /api              API routes for data fetching
  - /azkar           Adhkar pages and routes
  - /duas            Duas pages and routes
  - /mushaf          Quran reader pages
  layout.tsx         Root layout component
  page.tsx           Home page
  globals.css        Global styles

/components
  - /ui              Low-level UI primitives
  - /common          Shared utility components
  - /layout          Layout components
  - /SurahsComponents  Surah-related components
  - /VersesComponents  Verse-related components

/contexts           React context providers

/data              Static data and configurations

/hooks             Custom React hooks

/lib               Utility functions and helpers

/public            Static assets

/types             TypeScript type definitions
```

## Key Components

### VerseSpeedDial
Complex context menu component activated by long-pressing verses, featuring:
- Custom hooks for animations and interactions
- Global state management for menu coordination
- Theme-aware styling
- Gesture detection and handling

### API Routes
- `/api/quran/[id]` - Fetches surah data and tafsir with caching
- `/api/adhkar/sabah` - Morning remembrances
- `/api/adhkar/masa` - Evening remembrances
- `/api/adhkar/general` - General remembrances
- `/api/duas` - Supplications collection

## State Management

The application uses:
- **React Hooks** (useState, useReducer, useCallback, useRef) for component state
- **localStorage** for persistence (theme preference, favorites, current position)
- **Custom hooks** for reusable logic (useTheme, useQuran, useSearch)
- **Custom DOM Events** for cross-component communication

## Data Sources

- **Quran Text and Tafsir** - Quran.com API (requires authentication)
- **Verse of the Day** - al-quran.cloud public API
- **Adhkar and Duas** - Local JSON data files
- **Surah Metadata** - TypeScript array configuration

## Environment Variables

Required for Quran data fetching:
```
QF_CLIENT_ID=your_quranapi_client_id
QF_CLIENT_SECRET=your_quranapi_client_secret
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linting
npm run lint
```

The development server runs on `0.0.0.0:5000` with 4GB memory allocation for optimal performance.

## Caching Strategy

- Surah data: 24-hour cache with Incremental Static Regeneration
- Adhkar/Duas: 1-hour cache
- Static assets: Long-term caching (1 year for fonts, 1 day for audio)

## Performance Features

- In-memory surah caching to prevent redundant API calls
- Request cancellation with AbortController
- Debounced search implementation
- Image optimization with AVIF and WebP format support
- Gzip compression enabled
- Security headers configured
- Lazy-loaded dynamic imports for large libraries


## License

This project is open source and available under the MIT License.