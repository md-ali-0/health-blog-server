# Presentation Layer

This layer is responsible for handling all interactions with the outside world. For this REST API, it consists of the API endpoints.

## Key Components:

-   **Routes:** Define the API endpoints (e.g., `/users`, `/posts`).
-   **Controllers:** Handle incoming HTTP requests, validate input, and call the appropriate application services. They then format the response and send it back to the client.
-   **Middleware:** Functions that process requests before they reach the controllers (e.g., for authentication, logging, rate limiting).
-   **API Documentation:** Setup for Swagger/OpenAPI.

This layer depends on the `application` layer to execute business logic.
