# Gyomu Schema

## Repository Overview

The `@gyomu/schema` package serves as a foundational shared infrastructure for the Gyomu project, providing a domain-driven schema and validation framework built on top of Effect and Standard Schema. Its primary responsibility is to define common contracts, including shared schemas, type definitions, service definitions, error-handling structures, entity definitions, and CRUD schema generators. 

By establishing these shared contracts, the package ensures type safety and consistency across the repository, enabling independent packages to maintain loose coupling while collaborating effectively. Additionally, it supplies utilities for source code and metadata analysis.

## Package Responsibilities

- Define domain-specific entity schemas, field definitions, and UI annotations that automatically generate complete CRUD schema suites.
- Establish a centralized, type-safe error handling strategy with consistent diagnostic context, operational policies, and recovery traits.
- Provide advanced structural schema representations for TypeScript code analysis, symbol management, and dependency tracking.
- Offer low-level infrastructure utilities including result wrappers, JSON schema representations, and robust date/time manipulation routines.

## Architecture

The package is structurally organized into foundational infrastructure, core domain logic, and specialized schema layers:

- **`src/core`**: Provides low-level infrastructure, shared type definitions, JSON schema structures, and standardized result patterns used across the package.
- **`src/error`**: Manages centralized domain-specific error handling, standardization, context, and operational policies utilized by various system layers.
- **`src/entity`**: Manages core domain entity definitions, CRUD schema generation, date logic, data conversion, and AST-based validation error resolution. It depends on `src/core` structures and feeds into schema definitions.
- **`src/schemas/typescript`**: Defines structural schemas for TypeScript code analysis, modeling symbols, members, imports, exports, and types for code metadata.
- **`src/schemas/gyomu`**: Defines data validation and CRUD schemas for business-specific entities, enforcing consistent data shapes for task management, workflows, and system configurations.

## Design Principles

- Define shared, persisted, and runtime-validated data exclusively as Effect Schemas to unify package contracts, and mandate schema annotations to support AI-driven generation and documentation.
- Place brand types centrally within this package to prevent identifier mismatches and ensure consistent reuse across boundaries.
- Separate service definitions from their implementations by providing only interfaces and Context Tags to minimize dependency coupling.
- Design utilities strictly as pure functions and prohibit any dependencies on other internal packages to prevent circular references and maintain unidirectional dependency flow.
- Enforce strict architectural boundaries by prohibiting business logic implementation, external input-output operations, and external dependencies beyond Effect, JavaScript standard libraries, and approved time libraries.

## Important Constraints

- Do not depend on external libraries other than Effect, standard JavaScript libraries, and date/time libraries.
- Do not depend on other `@gyomu` packages.
- Do not implement business logic.
- Do not perform file system, network, or database I/O.
- Preserve the existing public export structure and exported symbols.

## Editing Rules

- Use Effect Schema for persisted and externally exchanged data.
- Design structured models rather than free-form strings.
- Keep parsing, concept generation, documentation generation, and rendering loosely coupled.
- Do not introduce circular dependencies between packages.
- Represent effectful operations with Effect.
- Represent errors in the Effect error channel instead of throwing exceptions.
- Validate AI-generated data with Effect Schema before use.
- Depend only on public APIs of other packages and avoid internal implementations.
- Do not depend on AI provider-specific APIs outside the Infrastructure layer.
- Generate documentation from structured data such as concepts.
- Avoid duplicating the same knowledge across multiple documents.
- Consolidate shareable logic into existing shared packages to avoid duplicate implementations.
- Update tests when observable behavior changes.
- Keep tests deterministic and independent of external services.
- Treat human-managed knowledge and code-derived knowledge as independent sources.
- Generate documents via the Document model rather than assembling Markdown strings directly.

## Navigation

This document provides a high-level overview of the package concept, responsibilities, and design decisions.

For more detailed information, refer to the following documents:



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