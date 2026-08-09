# Gyomu UI Core

## Repository Overview

The `@gyomu/ui-core` package serves as the foundational UI layer for Gyomu, providing a structured framework for automated form generation and robust error management. Its primary responsibility is to derive forms and UI structures directly from data schemas, centralizing input validation, error handling, and rendering configurations into a unified model. By decoupling UI implementation from underlying data models, the package ensures type-safe and consistent user interface behavior. It acts as the orchestration layer for maintaining uniform data entry and feedback mechanisms across the application.

## Package Responsibilities

- Bridge raw data schemas with UI rendering requirements through domain-specific metadata.
- Orchestrate the automated generation and state initialization of dynamic forms.
- Enforce schema-based validation for individual form fields and aggregate structures.
- Standardize UI-level error reporting, categorization, and recovery workflows.
- Provide extensible mappings between widget types and their corresponding reactive components.

## Architecture

The architecture is organized into a root orchestration layer that aggregates specialized domains for form generation, metadata transformation, and error management:

*   **`src/dsl`**: Functions as the transformation layer, converting raw data schemas into UI-compatible metadata and field attributes.
*   **`src/engine`**: Serves as the core processing hub, containing `src/engine/autoForm`. This directory manages the construction of default values, schema validation against CRUD constraints, and the mapping of field types to form widgets.
*   **`src/error`**: Provides a centralized infrastructure for categorizing and resolving UI-related errors, offering a standardized framework that the engine consumes to handle validation or processing faults.

The `src` root acts as the library's unified entry point, exposing the DSL structures and engine logic while integrating the error handling system as a support service for form operations. This hierarchical structure ensures that metadata definition remains decoupled from the execution logic of form generation and validation.

## Design Principles

- UI derivation from schema: All interface structures must be generated from defined schemas to ensure strict consistency with data models.
- Decoupling of concerns: UI definitions must be managed as domain-specific languages (DSL) separate from rendering logic and underlying data models to maximize reusability and prevent environment-specific dependencies.
- Single source of truth for validation: Input validation must rely solely on schema definitions, ensuring that business logic remains independent of the UI layer.
- Centralized error management: Error handling must utilize a unified model and shared handlers, explicitly prohibiting the embedding of error-processing logic within individual UI components.
- Restricted component responsibility: React components must be limited to rendering UI models, strictly forbidding the implementation of application-specific workflows or business logic within the presentation layer.

## Important Constraints

- Do not depend on application-specific UI logic.
- Do not implement business logic.
- Do not modify data models to accommodate UI requirements.
- Do not include components tied to specific screens or workflows.
- Maintain compatibility with `@gyomu/schema`, `effect`, and `react`.
- Preserve the existing 12-symbol public API surface across `.`, `./dsl`, and `./engine`.
- Do not deviate from the established barrel file export strategy.
- Ensure all form widget rendering remains decoupled from the engine via `RendererMap`.
- Adhere to the defined separation between functional concerns (core, dsl, error) and public exports.

## Editing Rules

- Use Effect Schema for all persisted or externally exchanged data structures.
- Design structured models instead of free-form strings for all data.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Do not introduce circular dependencies between packages.
- Represent all side effects using Effect.
- Use the Effect error channel for all error handling instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before use.
- Avoid dependencies on specific AI provider APIs outside of the Infrastructure layer.
- Generate documentation from structured concept data rather than manual writing.
- Keep knowledge sources unique to avoid duplication across documents.
- Depend only on public APIs of other packages.
- Consolidate common logic into shared packages to avoid duplicate implementations.
- Update or add tests whenever observable behavior changes.
- Keep tests deterministic and independent of external services.
- Maintain human-managed knowledge and derived source code knowledge as independent sources.
- Generate Markdown documentation via the Document model rather than raw string manipulation.

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