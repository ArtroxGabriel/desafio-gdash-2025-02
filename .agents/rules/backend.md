---
trigger: model_decision
description: Apply this rule to all .ts files within the backend directory to ensure type safety and consistency with the project's compiler configuration
---

**Rule Content:**

* **Strict Mode:** Enable all strict type-checking options. `strictNullChecks` must be respected; do not use the non-null assertion operator (`!`) unless absolutely necessary.
* **No Implicit Any:** While the current `tsconfig.json` has `noImplicitAny: false`, you must explicitly type all function parameters, return types, and complex objects to maintain long-term maintainability.
* **Module System:** Use `nodenext` for module resolution and `ES2023` as the target for modern JavaScript features.
* **Path Aliases:** Always use defined path aliases for imports: `@core/*`, `@common/*`, `@weather/*`, `@user/*`, and `@auth/*`.

## Functional Logic with Effect-TS

**Description:** Apply this rule when writing services, repositories, or any business logic that involves error handling, side effects, or asynchronous operations.
**Rule Content:**

* **Effect Wrapping:** Wrap all logic and external calls (Mongoose, JWT, Bcrypt) in `Effect` blocks.
* **Generator Usage:** Use `Effect.gen` for complex workflows to maintain a readable, imperative-like flow while staying functional.
* **Piping:** Use `pipe()` or `.pipe()` for simple transformations or error mapping.
* **Execution:** Do not run effects inside services. Use the `runNest` utility in controllers to bridge `Effect` with NestJS's asynchronous execution.

## Logic Flow and Error Handling

**Description:** Apply this rule during the implementation of any function to ensure "fail-fast" behavior and developer-friendly debugging.
**Rule Content:**

* **Early Returns:** Use early returns to handle edge cases or validation failures immediately. Avoid deep nesting or "if-else" ladders.
* **Explicit Error Mapping:** Never allow errors to fail silently. Use `Effect.tapError` or `Effect.mapError` to log the failure and map it to a specific `AuthErrorClass` or `HttpException`.
* **Logging:** Utilize the NestJS `Logger`. Log the start of critical operations (e.g., "Signing up user"), warnings for expected failures (e.g., "Invalid password"), and errors for system defects.
* **No Sugar-Coating:** Maintain professional, direct error messages that accurately describe the failure.

## NestJS Architecture and Standards

**Description:** Apply this rule when creating or modifying NestJS components (Controllers, Services, Modules).
**Rule Content:**

* **Dependency Injection:** Always use constructor-based injection for services and configurations.
* **Global Prefix:** All API routes must reside under the `api` prefix.
* **Config Management:** Use `ConfigService` with typed configuration objects (e.g., `ServerConfig`, `TokenConfig`) instead of accessing `process.env` directly.
* **Documentation:** Ensure all new endpoints are compatible with the `OpenApiSetup` for Swagger/Scalar documentation.