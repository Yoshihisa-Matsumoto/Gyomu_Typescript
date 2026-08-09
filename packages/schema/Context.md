# Gyomu Schema

## Repository Overview

The `@gyomu/schema` package provides the foundational framework for the Gyomu project, defining shared domain entities, type definitions, and service contracts. It serves as the primary reference for structural validation and consistent communication throughout the system.

This package maintains architectural integrity by providing universal utility definitions and standardized diagnostic patterns. It facilitates loose coupling between services, ensuring type safety and structural consistency, while enabling automated CRUD generation and complex data conversion across the project.

## Package Responsibilities

- Define and maintain formal schemas for core business domain entities.
- Centralize the application's error classification, context management, and operational policy logic.
- Provide advanced tooling for TypeScript meta-programming, including symbol analysis, dependency tracking, and structural type modeling.
- Establish standardized result patterns and JSON serialization protocols for predictable public API communication.
- Enable automated CRUD schema suite generation for domain-driven development.

## Architecture

The architecture is organized into four primary functional layers:

*   **Foundation (`src/core`)**: Provides the low-level infrastructure, including standardized result patterns, JSON schema definitions, and utilities for type safety and stack trace introspection. This layer underpins the behavior of all higher-level modules.
*   **Domain Modeling (`src/entity` & `src/schemas/gyomu`)**: Manages domain entities and business-specific logic. `src/entity` provides the framework for schema-based data structure definition, validation, and conversion, while `src/schemas/gyomu` implements the concrete CRUD schemas for business entities such as task management and service configurations.
*   **Analysis Layer (`src/schemas/typescript`)**: Contains structural schemas for static code analysis. It models TypeScript symbols, members, and module connectivity, serving as the interface for documentation and analysis tools to represent code metadata.
*   **Error Handling (`src/error`)**: Operates as a cross-cutting concern providing a centralized strategy for error classification and diagnostic context. It defines base traits and operational policies that other modules use to report failures and enforce consistent exception handling.

Dependencies flow from the foundation upwards, with domain and analysis schemas leveraging core utilities and standardized error patterns to maintain consistency across the system.

## Design Principles

- Centralize all shared data, persistent state, and runtime-validated data as Effect Schema to ensure unified cross-package contracts.
- Enforce strict independence by forbidding dependencies on other @gyomu packages, external libraries beyond standard ones, and any I/O operations or business logic.
- Decouple service definitions by providing only interfaces and Context Tags, excluding implementations to maintain minimal, unidirectional dependencies.
- Prioritize immutability and declarative design in APIs to prevent state-related side effects and simplify integration.
- Mandate descriptive Schema Annotations to support runtime validation as well as automated code and documentation generation.
- Utilize shared branded types to enforce type safety and prevent identifier ambiguity across the ecosystem.

## Important Constraints

- Do not depend on any external libraries other than Effect, JavaScript standard libraries, and date/time libraries (specifically `date-fns`).
- Do not depend on other `@gyomu` packages.
- Do not perform file system, network, or database I/O.
- Do not implement business logic within this package.
- Preserve the existing public export structure and ensure all 406 exported symbols remain stable.
- Ensure all structural data contracts are defined via schemas to guarantee runtime validation and static type safety.
- Maintain the decoupling of operational policies (e.g., retry, logging) from domain-specific implementation logic.
- Do not modify the existing error categorization strategy or the interface-based design of core services like the logger.
- Ensure all schema definitions and type manipulations remain strictly decoupled from I/O-bound operations.

## Editing Rules

- Use Effect Schema for all data structures that are persisted or exchanged with external systems.
- Design structured models instead of using free-form strings wherever possible.
- Keep analysis, concept generation, document generation, and rendering loosely coupled.
- Do not introduce circular dependencies between packages.
- Represent all effectful operations using Effect.
- Represent errors through the Effect Error Channel instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before use.
- Do not depend on AI provider-specific APIs outside of the Infrastructure layer.
- Generate documentation from structured data such as concepts.
- Maintain a single source of truth for knowledge and avoid duplicating information across documents.
- Depend only on public APIs of other packages.
- Centralize shared logic into existing common packages to avoid duplicate implementations.
- Update or add tests whenever observable behavior changes.
- Design tests to be deterministic and avoid dependencies on external services.
- Treat human-managed knowledge and source-derived knowledge as independent data sources.
- Generate documents via the Document model rather than constructing Markdown strings directly.

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