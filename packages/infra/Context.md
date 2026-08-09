# Gyomu Infra

## Repository Overview

The `@gyomu/infra` package serves as the core infrastructure layer for the Gyomu ecosystem. It provides an Effect-based abstraction of low-level system interactions, including file operations, database connectivity, network communication, and data serialization. By isolating platform-specific implementations and external dependencies, the package establishes a consistent, type-safe execution environment. It acts as a foundational architecture that enforces uniform error handling and dependency injection patterns, ensuring that application logic interacts with stable, abstracted interfaces rather than direct system or library-specific implementations.

## Package Responsibilities

- Provide uniform wrappers and error handling for platform-specific I/O operations.
- Manage centralized application configuration via environment-driven providers.
- Define service layers that facilitate dependency injection for databases and external APIs.
- Enable streaming-based data transformation between structured models and external formats.
- Encapsulate infrastructure concerns to decouple business logic from runtime environments.

## Architecture

The application architecture is organized into functional domains centered within the `src` directory, which manages global configuration and dependency injection to initialize service layers.

- **`src/fs`**: Provides an abstraction layer for file system operations, utilizing utility functions for path matching and error handling to support higher-level file access services.
- **`src/web`**: Handles network communication, including HTTP requests and data stream processing, integrating parsing utilities to structure JSON and XML responses.
- **`src/db`**: Manages the infrastructure layer for database connectivity (Kysely, MSSQL) and repository abstractions, ensuring consistent interaction with underlying data stores.
- **`src/csv`**: Facilitates bidirectional transformation between structured records and CSV-formatted streams, utilizing schema definitions to ensure data consistency during parsing and encoding.

These modules operate as distinct infrastructure layers, with `src` acting as the central hub that supplies configuration providers and runtime context to initialize services across these specialized domains.

## Design Principles

- Centralize all side effects within an Effect-based management system to ensure type-safe error handling and predictable execution.
- Abstract external libraries and platform-specific implementations behind service interfaces to decouple application logic from infrastructure details.
- Enforce data integrity at system boundaries by integrating schema validation with strict data transformation processes.
- Prioritize stream-based implementations for high-volume data processing to maintain system scalability and performance.
- Maintain structural independence by preventing infrastructure modules from referencing specific application domain models or business logic.

## Important Constraints

- Do not implement business logic. - Do not depend on domain models specific to any external application. - Do not assume direct utilization of Node.js standard APIs; use `@effect/platform` abstractions instead. - Do not expose external library APIs (e.g., `kysely`, `ssh2`, `csv`) directly in the public API. - Do not execute side effects outside of the `Effect` ecosystem. - Do not modify existing exported symbols or break the `./*` export structure. - All database operations must utilize the defined `Effect`-based repository abstractions. - All infrastructure configuration must be managed via the provided Layer pattern for dependency injection. - Streaming operations must preserve the defined separation between raw and schema-validated processing. - Authentication utilities must remain configuration-driven and decoupled from specific user domain entities.

## Editing Rules

- Use Effect Schema to define all data structures intended for persistence or external exchange.
- Design structured models instead of relying on free-form strings.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Avoid circular dependencies between packages.
- Represent all side effects using the Effect library.
- Represent errors through the Effect error channel rather than throwing exceptions.
- Validate all AI-generated data with Effect Schema before usage.
- Depend only on the Infrastructure layer for AI provider-specific APIs.
- Generate documentation from structured data like Concept models.
- Avoid duplicating knowledge across different documents.
- Depend only on public APIs of other packages.
- Consolidate reusable logic into existing shared packages to prevent redundant implementations.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and free from external service dependencies.
- Maintain human-managed knowledge and code-derived knowledge as independent data sources.
- Generate Markdown through the Document model rather than direct string concatenation.

## Navigation

This document provides a high-level overview of the package concept, responsibilities, and design decisions. For more detailed information, refer to the following documents:

- **Architecture Documentation**
  Describes the internal architecture, major components, dependencies, and design decisions of this package.
- **API Reference**
  Describes public APIs, exported modules, and usage patterns.

- **Technical Documentation**
  Describes technical details, configuration, dependencies, and implementation-specific information.

- **Development Guide**
  Describes development workflows, coding conventions, testing strategies, and contribution guidelines.

- **Project Knowledge**
  Contains additional knowledge maintained by developers, including constraints, rationale, terminology, and operational guidelines.


When modifying this package, review the relevant documentation before making changes to preserve the intended responsibilities and architectural boundaries.