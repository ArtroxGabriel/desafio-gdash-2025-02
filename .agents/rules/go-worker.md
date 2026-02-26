---
trigger: model_decision
description: Apply this rule when creating new services, clients, or extending the application entry point to ensure consistency with the samber/do DI container
---

**Rule Content:**

* **Provider Pattern:** All new components must be defined as `do.Package` functions that provide the service to the injector.
* **Invoke Standards:** Use `do.MustInvoke` for mandatory dependencies and `do.MustInvokeAs` when injecting via interfaces to facilitate testing.
* **Graceful Shutdown:** Always use `signal.NotifyContext` with `syscall.SIGTERM` and `os.Interrupt`. Ensure all long-running processes (like consumers) respect the `ctx.Done()` signal to close connections cleanly.

## RabbitMQ Consumer Standards

**Description:** Apply this rule when modifying the consumer package or adding new queue listeners.
**Rule Content:**

* **Connection Management:** Always use `defer` to close both the RabbitMQ Channel and Connection in the reverse order of opening.
* **Message Acknowledgement:** * Use `d.Ack(false)` only after successful processing and storage.
* Use `d.Nack(false, false)` for malformed messages (e.g., failed unmarshaling) to avoid infinite loops in the queue.


* **Blocking Loops:** Implement the main consumer loop using a `select` statement that prioritizes `ctx.Done()` to ensure the worker remains responsive to shutdown signals.

## HTTP Client and API Communication

**Description:** Apply this rule to any service responsible for external API communication, such as the `ClientService`.
**Rule Content:**

* **Resiliency Patterns:** Implement exponential backoff for retriable errors (5xx, network timeouts). Use constants for `MaxRetries`, `BaseBackoff`, and `BasePowerBackoff`.
* **Error Classification:** Distinguish between permanent client errors (4xx) and temporary server errors (5xx). Permanent errors must abort the retry loop immediately using the custom `ClientError` type.
* **Context Propagation:** Always pass `context.Context` to `http.NewRequestWithContext` to ensure timeouts and cancellations are respected.
* **Security:** Ensure sensitive headers, such as `x-api-key`, are pulled from the `Config` struct and never hardcoded.

## Testing Standards (Future Implementation)

**Description:** Apply this rule when implementing new tests to ensure consistency as the testing suite is established.
**Rule Content:**

* **Interface Mocking:** Since services are injected via interfaces (e.g., `ClientInterface`), use mocks for unit testing to isolate business logic from external side effects.
* **Environment Isolation:** Tests should not rely on a running RabbitMQ instance or external API. Use build tags or environment variables to toggle between unit tests and integration tests.
* **Table-Driven Tests:** Follow standard Go practices by using table-driven tests for complex logic, such as the exponential backoff calculation or message unmarshaling.

## Error Handling and Logging

**Description:** Apply this rule across the entire Go codebase to maintain a professional and traceable execution flow.
**Rule Content:**

* **Structured Logging:** Use `log/slog`. Prefer `InfoContext`, `ErrorContext`, and `DebugContext` to ensure context-bound metadata is preserved.
* **Fail Fast:** If critical configurations fail to load or essential services cannot start, log the error and terminate the process using an explicit `fail()` function that calls `os.Exit(1)`.
* **No Sugar-Coating:** Error logs must be direct and include the raw error message via `slog.String("error", err.Error())`.
* **Early Returns:** Maintain flat logic by returning early on errors, especially within the main execution flow and retry loops.