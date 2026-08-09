# Gyomu Config

## Repository Overview

The `@gyomu/config` package provides a centralized configuration platform for the Gyomu project. It serves as an infrastructure layer that aggregates, merges, and resolves application settings across global, user, and scoped hierarchies. By enforcing validation through Effect Schema, the package ensures that all configuration data is type-safe before being delivered to consumers. This architecture establishes a consistent mechanism for configuration management, allowing the application to reliably retrieve validated settings while maintaining type safety throughout the system.

## Package Responsibilities

- Orchestrate the multi-stage resolution of configuration values from diverse sources.
- Enforce precedence and merging logic to generate a coherent application state.
- Validate resolved configuration against defined schemas before providing it to the application.
- Provide structured error reporting and contextual metadata to support fault-tolerant configuration lookups.
- Maintain lifecycle awareness of the configuration resolution process.

## Architecture

The package is structured around two primary architectural areas: the core resolution service and the error management layer.

*   **`src/`**: Acts as the central hub for configuration orchestration. This area houses the resolution service, which defines the lifecycle of configuration retrieval, merging, and validation. It coordinates the ingestion of settings from global, user, and scope-based sources, applying precedence rules to produce a final, type-safe configuration result based on provided resolution criteria.

*   **`src/errors/`**: Provides a specialized framework for handling failures within the resolution process. This directory defines the structures required to categorize and report resolution errors, including context and metadata regarding the specific resolution phase.

The architecture maintains a dependency where the core resolution service relies on the error components to categorize and represent failures encountered during the retrieval and validation lifecycle. This separation ensures that resolution logic remains decoupled from the specific mechanisms of error reporting and metadata capture.

## Design Principles

- Centralize configuration resolution through a dedicated service to abstract underlying storage mechanisms, ensuring decoupling between configuration sources and consumers.
- Enforce strict type safety and immutability throughout the resolution process to maintain data integrity and predictable state management.
- Validate all configurations using Effect Schema prior to consumption to enable early detection of errors and ensure adherence to defined schemas.
- Employ a hierarchical merging strategy with deterministic priority, providing a flexible and extensible architecture for multi-scope configuration management.
- Utilize declarative patterns for configuration resolution to minimize side effects and isolate concerns, strictly limiting the module's responsibility to configuration retrieval and error diagnostics.

## Important Constraints

- Do not depend on concrete persistence mechanisms (file system, environment variables, databases).
- Do not implement storage drivers or configuration persistence logic.
- Do not include application-specific configuration keys or values.
- Do not implement business logic.
- Do not introduce responsibilities outside of configuration resolution, merging, and validation.
- Preserve the existing public export structure (7 symbols exported from `.`).
- Do not modify the existing dependency set (`@gyomu/infra`, `@gyomu/schema`, `effect`).
- Maintain the use of the Service pattern and DI for all configuration resolution interfaces.
- Ensure all resolved configuration values conform to schemas defined via `@gyomu/schema`.
- Maintain strict separation between configuration resolution phases within `src/errors`.

## Editing Rules

- Use Effect Schema to define all data structures used for persistence or external communication.
- Design structured models instead of relying on free-form strings.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Do not introduce circular dependencies between packages.
- Represent all side effects using Effect.
- Represent errors through the Effect Error Channel instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before use.
- Do not depend on provider-specific AI APIs outside of the Infrastructure layer.
- Generate documentation from structured data such as concepts.
- Avoid duplicating knowledge across multiple documents.
- Depend only on public APIs of other packages.
- Consolidate reusable logic into existing shared packages.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and free from external service dependencies.
- Maintain human-managed knowledge and derived source-code knowledge as independent sources.
- Generate documentation through the Document model rather than constructing Markdown strings directly.

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