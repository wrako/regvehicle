# Repository Guidelines

## Project Structure & Module Organization
The backend lives in `IdeaProjects/management`, a Spring Boot 3.5 service targeting Java 21. Package `sk.zzs.vehicle.management` stays split by concern (`config`, `controller`, `dto`, `entity`, `repository`, `service`, `util`); create new classes inside the matching package to keep wiring simple. Shared configuration such as the MariaDB datasource and the upload root (`C:/uploads/vehicles`) sits in `src/main/resources/application.properties`. Mirror backend tests under `src/test/java/sk/zzs/vehicle/management` so Spring can detect them automatically. The Next.js 15 UI resides in `WebstormProjects/untitled` with routes in `src/app`, reusable widgets in `src/components`, custom hooks in `src/hooks`, and the API client in `src/lib/api.ts`.

## Build, Test, and Development Commands
Backend: `./mvnw spring-boot:run` starts the API, `./mvnw clean package` produces a runnable jar in `target/`, and `./mvnw test` runs the Spring Boot test suite. Frontend: `npm install` (once) pulls node modules, `npm run dev` serves the dashboard on port 3000, `npm run build` compiles for production, while `npm run lint` and `npm run typecheck` gate formatting and types.

## Coding Style & Naming Conventions
Use four spaces for Java indentation, PascalCase for classes, camelCase for methods and fields, and keep REST paths kebab-cased (`/network-points/{id}`). Stick with the existing layered naming convention (`VehicleService`, `VehicleRepository`, `VehicleDto`). Lombok is configured for chained setters; prefer `@Builder` or DTO mappers over manual constructors. In the Next.js app, keep components PascalCase, hooks prefixed with `use`, and colocate feature-specific styles with the component or route using Tailwind utility classes. Avoid sprinkling new fetch helpers—extend `src/lib/api.ts` instead.

## Testing Guidelines
Rely on `spring-boot-starter-test` (JUnit 5, Mockito). New service logic should ship with focused tests (`VehicleServiceTest`, `ProviderControllerIT`) under the mirrored package path. For repository specs, prefer `@DataJpaTest` with an embedded database or testcontainers when MariaDB specifics matter. The frontend currently lacks automated tests; at minimum run `npm run lint` and `npm run typecheck`, and add React Testing Library cases when you touch interactive components.

## Commit & Pull Request Guidelines
History shows concise, title-style commits (for example, `Archived Expired NetworkPoint`); continue using short, action-oriented summaries and keep bodies for context or migration steps. Before opening a PR, ensure `./mvnw test` and `npm run lint` pass, describe the change, reference any tracking ticket, and attach UI screenshots or API contract notes when behavior shifts.

## Security & Configuration Tips
Keep secrets out of version control: override database credentials via environment variables or a local `application-local.properties`, and point uploads to a safe path when not on Windows. For the UI, configure `NEXT_PUBLIC_API_BASE` in `.env.local` so deployments hit the correct API domain, and never hardcode tokens in source files.
