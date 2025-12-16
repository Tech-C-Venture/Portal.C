# Technology Stack

## Architecture

Currently: Standard Next.js application structure with direct database access from UI components.
Target: Clean Architecture with proper layer separation (Domain, Application, Infrastructure, Presentation).

## Core Technologies

- **Language**: TypeScript 5.6+
- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js 18+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: ZITADEL via NextAuth.js 4.24
- **Styling**: Tailwind CSS 3.4
- **UI Components**: @openameba/spindle-ui 3.1.4

## Key Libraries

- **@supabase/ssr**: Server-side rendering support for Supabase
- **@supabase/supabase-js**: Supabase client library
- **next-auth**: Authentication for Next.js
- **date-fns**: Date manipulation utilities
- **matter-js**: Physics engine for hero animations
- **clsx**: Utility for constructing className strings

## Development Standards

### Type Safety
- TypeScript strict mode enabled
- No `any` types - use proper type definitions
- Database types generated from Supabase schema

### Code Quality
- ESLint with Next.js configuration
- Consistent file naming and structure
- Component-based architecture

### Testing
- Testing infrastructure to be established during clean architecture migration

## Development Environment

### Required Tools
- Node.js 18+
- npm or yarn
- Supabase CLI (for type generation)
- Git

### Common Commands
```bash
# Dev: npm run dev
# Build: npm run build
# Start: npm start
# Lint: npm run lint
# Type generation: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

## Key Technical Decisions

1. **Next.js 15 App Router**: Modern React architecture with server components
2. **Supabase**: Managed PostgreSQL with built-in auth, real-time, and storage capabilities
3. **ZITADEL for Auth**: Enterprise-grade authentication separate from application logic
4. **Spindle UI**: Consistent design system for UI components
5. **Clean Architecture Migration**: Planned refactoring to separate concerns and improve testability

## Infrastructure

- **Hosting**: Vercel (optimized for Next.js)
- **Database**: Supabase-managed PostgreSQL
- **Auth Provider**: ZITADEL instance

---
_Document standards and patterns, not every dependency_
