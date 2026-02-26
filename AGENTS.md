# 🤖 Agent System Instructions (GDASH 2025/02)

Welcome, agent. This repository is a polyglot full-stack weather system. This file provides technical context and rules for you to operate efficiently.

## 🛠️ Build, Lint, & Test Commands

### 🧊 Backend (NestJS + Effect)
- **Install:** `pnpm install` | **Build:** `pnpm run build` | **Lint:** `pnpm run lint`
- **Test (All):** `pnpm run test` | **Test (Single File):** `pnpm exec jest src/path/to/file.spec.ts`
- **Test (Single Case):** `pnpm exec jest src/path/to/file.spec.ts -t "Test name"`

### 🎨 Frontend (React + Vite)
- **Install:** `pnpm install` | **Dev:** `pnpm run dev` | **Build:** `pnpm run build`
- **Lint:** `pnpm run lint`

### 🐹 Go Worker
- **Install:** `go mod download` | **Build:** `go build ./cmd/worker`
- **Test (All):** `go test ./...` | **Test (Single Case):** `go test -v ./pkg/api_client -run TestSaveData`

### 🐍 Python Collector (uv)
- **Install:** `uv sync` | **Run:** `uv run main.py`

---

## 🎨 Code Style Guidelines

### 🛠️ General (TypeScript)
- **Strict Mode:** Always enabled. Use `unknown` instead of `any`.
- **Types:** Prefer `interface` over `type` (except for unions/intersections).
- **Structure:** Use early returns; avoid nested conditionals. Prefer composition over inheritance.

### 🧊 Backend (NestJS/Effect)
- **Paradigm:** Functional business logic using `Effect`. Prefer `Effect.gen` with `yield*`.
- **Error Handling:** Define errors as `Data.TaggedError` classes. Bridge to Nest via `mapToHttpException`.
- **Imports:** Use absolute path aliases: `@auth/*`, `@common/*`, `@core/*`, `@user/*`, `@weather/*`.
- **Naming:** Controllers: `*.controller.ts`, Services: `*.service.ts`, DTOs: `*.dto.ts`, Schemas: `*.schema.ts`.
- **Mongoose:** Inject via `@InjectModel`. Wrap calls in `Effect.tryPromise`.

### 🐹 Go Worker
- **DI/Logging:** Use `samber/do` for DI and `log/slog` for structured logging.
- **Errors:** Standard Go handling. Use `fmt.Errorf("...: %w", err)` for wrapping.
- **Retries:** Exponential backoff required for external API communications.

### 🎨 Frontend (React)
- **State:** Simple hooks (`useState`, `useContext`) unless high complexity.
- **HTTP:** `axios` with interceptors for JWT injection.

---

## 🔐 Critical Rules & Conventions

### 🛑 Error Handling & UI States
- **NEVER swallow errors silently.** Always show user feedback and log for debugging.
- **UI States:** Always handle: `loading`, `error`, `empty`, `success`. 
- **Loading:** Show only when no data exists. Disable buttons and show indicators during mutations.
- **Lists:** Every list component must have an empty state.
- **Mutations:** Always provide an `onError` handler with user-visible feedback.

### 🌿 Git Conventions
- **Branch naming:** `{initials}/{description}` (e.g., `jg/add-weather-fetch`).
- **Commit format:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **PR Titles:** Must follow the commit format.

### 🧪 Testing
- **TDD:** Write a failing test first.
- **Factories:** Use factory pattern: `getMockUser(overrides)`.
- **Behavior:** Test behavior, not implementation details.
- **Verification:** Run relevant tests before committing changes.

---

## 🏗️ Architecture Flow
1. **Python Collector:** Periodically fetches from Weather API.
2. **RabbitMQ:** Message broker for collected data.
3. **Go Worker:** Consumes, validates, and POSTs to NestJS.
4. **NestJS API:** Persists to MongoDB and serves React Dashboard.
5. **React Dashboard:** Displays data and AI-generated insights.

## 🔐 Credentials & Operation
- **Default Admin:** `admin@gdash.io` / `admin123` | **Header:** `x-api-key`.
- **Paths:** Always use absolute paths for tools.
- **Verification:** Run `lint` and `build` after backend changes to prevent regressions.

---
*Updated on 2026-02-26 for GDASH Challenge.*
