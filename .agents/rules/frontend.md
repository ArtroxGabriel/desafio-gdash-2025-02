---
trigger: model_decision
description: Apply this rule when initializing and developing the React application within the frontend directory.
---

**Rule Content:**

* **Modern React:** Use Functional Components with Hooks exclusively. Class components are prohibited.
* **Strict TypeScript:** All components and utility functions must have explicit type definitions for props and return types.
* **Vite-Based Build:** Follow the configurations defined in `vite.config.ts` and `tsconfig.app.json` for development and bundling.
* **Path Aliasing:** Configure and use path aliases (e.g., `@components/*`, `@hooks/*`) to avoid deep relative imports, maintaining consistency with the backend structure.

## State and Data Management

**Description:** Apply this rule when handling application data and interacting with the backend API.
**Rule Content:**

* **Async Operations:** Use `loading` and `error` states for all API calls to ensure a consistent user experience during data fetching.
* **Environmental Config:** API URLs and other environment-specific constants must be accessed via `import.meta.env` and defined in `.env` files.
* **Type-Safe DTOs:** Create shared or mirrored TypeScript interfaces that match the backend DTOs (e.g., `WeatherResponseDto`) to ensure end-to-end type safety.

## Styling and UI

**Description:** Apply this rule when implementing the visual layer of the application.
**Rule Content:**

* **CSS Consistency:** Follow the established styling patterns in `index.css` and `App.css`. Prefer CSS modules or a utility-first framework if scalability is required.
* **Component Isolation:** Maintain a clear separation between "dumb" presentational components and "smart" container components that handle logic.

## Testing Standards (Pre-emptive)

**Description:** Apply this rule from the start of development to ensure high code quality.
**Rule Content:**

* **Component Testing:** Every new UI component must have a corresponding test file (e.g., `ComponentName.spec.tsx`) using Vitest or Jest.
* **Mocking:** Use Mock Service Worker (MSW) or similar tools to mock backend API responses during frontend development and testing.

## Logic and Flow

**Description:** Apply this rule during the implementation of frontend logic to maintain gabrigas's technical standards.
**Rule Content:**

* **Early Returns in Rendering:** Use early returns within component render functions to handle loading and error states before the main UI logic.
* **No Silent Failures:** Log API errors to the console in development and use a global error boundary for production to prevent application crashes.
* **Professional Tone:** All user-facing labels and error messages must be professional, direct, and in English.