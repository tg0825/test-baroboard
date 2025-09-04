# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack (Next.js 15.4.1)
- `npm run build` - Build for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Testing
- `npm run test` - Run Playwright end-to-end tests
- `npm run test:ui` - Run tests with UI
- `npm run test:report` - Show test report

### Deployment
- `npm run export` - Build static export
- `npm run deploy:firebase` - Build and deploy to Firebase Hosting

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.4.1 with App Router + React 19.1.0
- **Styling**: Tailwind CSS 3.4.17 + custom design system
- **Charts**: Recharts 3.1.2 for data visualization
- **Backend**: Firebase (Firestore + Auth + Analytics)
- **AI Integration**: n8n chatbot (0.47.0)
- **Testing**: Playwright 1.54.1

### Key Components Architecture

**Authentication Flow**:
- `AuthProvider` (`src/contexts/AuthContext.tsx`) manages user state via localStorage
- Login/session state persists across page refreshes
- Login redirects happen at the route level in `src/app/page.tsx`

**Dashboard System**:
- `Dashboard` (`src/components/Dashboard.tsx`) - Main container coordinating data flow
- `Container` (`src/components/Container.tsx`) - Displays query results with AI analysis, charts, and tables
- `LNB` (`src/components/LNB.tsx`) - Left sidebar with query list and search

**Data Flow**:
1. `useApiData` hook manages main page data and loading states
2. Query selection triggers 3-stage API calls:
   - Pre API: Gets `latest_query_data_id` and query metadata
   - Detail API: Returns HTML for AI analysis display
   - Plain API: Returns JSON data for charts and tables

**SPA Routing**:
- Custom client-side routing with URL management (`/query/{id}`)
- Browser history integration with `pushState`/`popstate`
- Custom events (`baroboard-route-change`) for route synchronization

### Firebase Integration
- Configuration in `src/firebase.ts` (API keys are public/non-sensitive)
- Firestore for query tracking and analytics
- Analytics integration for user behavior monitoring
- Auth setup ready but not actively used in current implementation

### Chart System
- Dynamic chart type selection based on data analysis
- Interactive column selection (click for X-axis, Shift+click for Y-axis)
- Support for bar, line, and pie charts with automatic type detection
- Column hiding/showing with context menus and settings modal

### Testing Strategy
- Comprehensive Playwright tests covering:
  - Authentication flows
  - Dashboard interactions  
  - Responsive design
  - Chart/table functionality
  - URL routing and navigation

### API Integration Patterns
- External n8n webhook APIs for data fetching
- API key management via localStorage (`baroboard_api_key`)
- Parallel API calls for performance
- Error handling with user-friendly messages
- Loading states for each component section

## Development Notes

### State Management
- React Context for authentication
- Custom hooks (`useApiData`) for API state
- Local state for UI interactions (pagination, column visibility)
- URL as source of truth for selected query

### Performance Considerations  
- Turbopack for fast development builds
- Static export capability for optimal deployment
- Lazy loading of chart libraries
- Pagination for large datasets (50 items per page)

### Code Patterns
- TypeScript throughout with strict typing
- Client components marked with `"use client"`
- Consistent error boundaries and loading states
- Responsive design with Tailwind utilities
- Test IDs for reliable E2E testing (`data-testid`)