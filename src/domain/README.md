# Domain Layer

This is the core of the application. It contains the enterprise-wide business logic and types. It is completely independent of any other layer.

## Key Components:

-   **Entities:** Objects with an identity that persists over time (e.g., `User`, `Post`). They contain core business logic.
-   **Value Objects:** Objects without a conceptual identity, defined by their attributes (e.g., `Address`, `Money`).
-   **Aggregates:** A cluster of associated objects that we treat as a single unit for data changes.
-   **Repository Interfaces:** Define the contracts for data persistence (e.g., `IUserRepository`). The implementation is in the `infrastructure` layer.

This layer has **zero** dependencies on other layers of this application.
