# Project Structure

## Organization Philosophy

**Current**: Standard Next.js structure with pages, components, and lib utilities.

**Target (Clean Architecture)**: Layer-based organization with clear dependency rules:
- **Domain Layer**: Business logic and entities (no external dependencies)
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External services (database, auth, APIs)
- **Presentation Layer**: UI components and pages (Next.js App Router)

## Directory Patterns

### Current Structure

#### Pages and Routing
**Location**: `/app/`
**Purpose**: Next.js App Router pages and API routes
**Example**: `/app/events/page.tsx`, `/app/api/auth/[...nextauth]/route.ts`

#### UI Components
**Location**: `/components/`
**Purpose**: Reusable React components
**Example**: `/components/layout/Navigation.tsx`, `/components/MatterHero.tsx`

#### Utilities and Clients
**Location**: `/lib/`
**Purpose**: Utility functions and external service clients
**Example**: `/lib/supabase/client.ts`, `/lib/auth.ts`

#### Type Definitions
**Location**: `/types/`
**Purpose**: TypeScript type definitions
**Example**: `/types/database.types.ts`, `/types/index.ts`

### Target Structure (Clean Architecture)

#### Domain Layer
**Location**: `/src/domain/`
**Purpose**: Core business entities, value objects, and business rules. No framework dependencies.
**Example**: `/src/domain/entities/Member.ts`, `/src/domain/value-objects/Email.ts`

#### Application Layer
**Location**: `/src/application/`
**Purpose**: Use cases, DTOs, and interfaces for external dependencies
**Example**: `/src/application/use-cases/RegisterForEvent.ts`, `/src/application/ports/MemberRepository.ts`

#### Infrastructure Layer
**Location**: `/src/infrastructure/`
**Purpose**: Implementations of external dependencies (DB, auth, external APIs)
**Example**: `/src/infrastructure/repositories/SupabaseMemberRepository.ts`, `/src/infrastructure/auth/ZitadelAuthProvider.ts`

#### Presentation Layer
**Location**: `/src/presentation/` (or keep in `/app/` and `/components/`)
**Purpose**: Next.js pages, components, controllers
**Example**: `/app/events/page.tsx` with controller separation

## Naming Conventions

- **Files**:
  - Components: PascalCase (e.g., `MemberCard.tsx`)
  - Utilities: camelCase (e.g., `formatDate.ts`)
  - Pages: kebab-case or lowercase (Next.js convention)
- **Components**: PascalCase
- **Functions**: camelCase
- **Types/Interfaces**: PascalCase

## Import Organization

```typescript
// External dependencies
import { createBrowserClient } from "@supabase/ssr";

// Internal absolute imports (current)
import { MatterHero } from "@/components/MatterHero";
import type { Event } from "@/types";

// Target (Clean Architecture)
import { Member } from "@/domain/entities/Member";
import { RegisterForEvent } from "@/application/use-cases/RegisterForEvent";
import { SupabaseMemberRepository } from "@/infrastructure/repositories/SupabaseMemberRepository";
```

**Path Aliases**:
- `@/`: Maps to project root (configured in tsconfig.json)

## Code Organization Principles

### Current State
- UI components directly import and use Supabase clients
- Business logic mixed with presentation logic
- No clear separation of concerns

### Target State (Clean Architecture)
1. **Dependency Rule**: Inner layers don't depend on outer layers
   - Domain → (no dependencies)
   - Application → Domain
   - Infrastructure → Application, Domain
   - Presentation → Application, Domain

2. **Dependency Inversion**: Application layer defines interfaces, infrastructure implements them

3. **Use Case Driven**: Each feature is a use case in the application layer

4. **Testability**: Business logic can be tested without UI or database

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
