# Application Layer

This layer contains the application-specific business logic. It orchestrates the flow of data between the presentation layer and the domain layer.

## Key Components:

-   **Services / Use Cases:** Encapsulate specific application functionalities (e.g., `CreatePost`, `RegisterUser`). They use domain entities and repositories to perform tasks.
-   **Data Transfer Objects (DTOs):** Simple objects used to transfer data between layers, particularly from the presentation layer to the application layer.

This layer depends on the `domain` layer but knows nothing about the `presentation` or `infrastructure` layers.
