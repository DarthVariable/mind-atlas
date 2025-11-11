# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mind Atlas is a cross-platform mobile application built with Angular 20 and Ionic 8, targeting iOS and Android via Capacitor. The project uses standalone Angular components (no NgModules) and follows Ionic's Angular standalone architecture.

## Development Commands

### Web Development
- `npm start` - Start development server
- `npm run build` - Production build (outputs to `www/`)
- `npm run watch` - Development build with file watching
- `npm test` - Run all tests with Karma/Jasmine
- `npm run lint` - Run ESLint on TypeScript and HTML files

### Mobile Development
The project has native platform directories (`android/`, `ios/`) managed by Capacitor.
- To sync web build with native platforms: `npx cap sync`
- To open in Android Studio: `npx cap open android`
- To open in Xcode: `npx cap open ios`
- After web code changes, rebuild with `npm run build` then run `npx cap sync`

## Architecture

### Architectural Style
**Layered Architecture** with clear separation of concerns across presentation, business logic, and data access layers.

### Folder Structure
The codebase follows a **Core/Features/Shared** organization:

- **`src/app/core/`** - Singleton services and app-wide functionality
  - `services/` - Global services (auth, logging, error handling, API clients)
  - `guards/` - Route guards
  - `models/` - Core domain models and interfaces
  - `utils/` - Core utility functions
  - Dependencies: Independent (no dependencies on Features or Shared)

- **`src/app/features/`** - Business domain features (self-contained modules)
  - Each feature contains: components, services, models, and routes
  - Features are organized by business domain
  - Dependencies: Can use Core and Shared

- **`src/app/shared/`** - Reusable UI components and utilities
  - `components/` - Reusable UI components
  - `pipes/` - Shared pipes
  - `services/` - Shared utility services
  - Dependencies: Can use Core only

**Dependency Flow Rules:**
- Features → Core + Shared (can use both)
- Shared → Core (can use Core only)
- Core → Independent (no internal dependencies)

### Application Bootstrap
- Entry point: `src/main.ts` - Uses Angular's `bootstrapApplication()` with standalone components
- Root component: `src/app/app.component.ts`
- Providers configured in bootstrap include:
  - `IonicRouteStrategy` for Ionic navigation
  - `provideIonicAngular()` for Ionic framework
  - Router with preloading strategy for all modules

### Routing Structure
- Main routes defined in `src/app/app.routes.ts`
- App uses tab-based navigation via `src/app/tabs/tabs.routes.ts`
- Feature routes should be defined in `features/[feature-name]/[feature-name].routes.ts`
- All components are loaded lazily using dynamic imports
- Route guards placed in `core/guards/`

### Component Architecture
- All components use Angular standalone component API (no NgModules)
- Components import Ionic components directly from `@ionic/angular/standalone`
- Page components use `Page` suffix (e.g., `Tab1Page`, `TabsPage`)
- Regular components use `Component` suffix (enforced by ESLint)
- Feature-specific components: `features/[feature-name]/components/`
- Reusable components: `shared/components/`
- Components are located alongside their templates, styles, and specs

### State Management
- **Signals-first approach**: Prefer Angular Signals over RxJS for synchronous state
- Use RxJS only for HTTP requests and complex async operations
- Global state services: `core/services/`
- Feature-specific state: `features/[feature-name]/services/`
- Shared utility services: `shared/services/`

### Styling
- Global styles: `src/global.scss`
- Theme variables: `src/theme/variables.scss`
- Component styles use SCSS and are scoped per component
- Budget limits: 2MB initial (warning), 5MB max; 2KB per component style (warning), 4KB max

### Configuration Files
- TypeScript config uses strict mode with Angular strict templates
- Component/directive selectors must use `app` prefix (enforced by ESLint)
- Components use kebab-case selectors, directives use camelCase
- Capacitor config: `capacitor.config.ts` - app ID is `io.ionic.starter`, web output to `www/`

### Environment Configuration
- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts`
- Production builds use file replacement to swap environment files

## Code Quality Standards

### TypeScript
- Strict mode enabled with Angular strict compilation
- `noImplicitReturns`, `noFallthroughCasesInSwitch` enforced
- Use `experimentalDecorators` for Angular decorators
- Target ES2022 with ES2020 modules

### ESLint Rules
- Components must have `Page` or `Component` suffix
- Component selectors: `app-*` prefix, kebab-case
- Directive selectors: `app*` prefix, camelCase
- Templates processed for inline template linting

## Sub-Agents

This project includes a custom **software-architect** sub-agent located at `.claude/agents/software-architect.md`. Use this agent when designing new features:

```
Task(subagent_type: "software-architect", prompt: "Design architecture for [feature description]")
```

The software-architect agent will:
- Research Angular/Ionic/Capacitor best practices using MCP tools
- Design architecture following Layered Architecture and Core/Features/Shared structure
- Generate comprehensive technical documentation with Mermaid diagrams
- Create detailed implementation guides
- Ensure alignment with Angular 20 signals-first and standalone component patterns
