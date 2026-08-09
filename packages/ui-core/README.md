# Gyomu UI Core

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a unified foundation for UI development within the Gyomu ecosystem. By deriving forms and structural components directly from data schemas, it centralizes input validation, error handling, and rendering configurations into a single, cohesive model. The framework facilitates a clean separation between UI implementation and underlying data structures. This approach ensures type-safe, consistent interfaces while automating form generation and standardizing error management. By leveraging domain schemas to drive UI metadata, the package enables developers to maintain a robust and scalable user experience across the entire application.

## Architecture

The architecture is organized into a centralized orchestration layer that integrates domain-specific transformations, automated form generation, and robust error management. At its core, the package utilizes a Domain-Specific Language (DSL) layer to bridge raw data schemas with UI-ready metadata, ensuring that structural definitions are consistently translated into form configurations.

The form generation engine acts as the primary service, leveraging this metadata to initialize state, map field types to reactive widgets, and enforce schema-based validation. This engine collaborates closely with the error handling system, which provides a standardized framework for categorizing faults and executing recovery workflows. By separating the DSL transformation logic from the operational engine and error management infrastructure, the package maintains a modular structure that ensures data integrity and consistent user feedback across the application.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ui-core
```

## Dependencies

This package requires a Node.js environment supporting ESM and is designed for use with Effect 4.x and React 19.x. It serves as a type-safe foundation for modern web applications, ensuring full compatibility with the latest React and Effect ecosystems. At runtime, the project relies on the Effect library for core runtime, schema validation, and context management. Additionally, it integrates with `@gyomu/schema` to provide shared type definitions and standardized data schemas across the application.

## Development

This package serves as a common infrastructure for UI development in Gyomu, providing a mechanism to derive forms and UI structures from data schemas. Its core focus is to decouple UI implementations from data models, achieving a type-safe and consistent interface. Contributors must ensure that the UI is defined as a structure derivable from a schema, enforcing a design that eliminates inconsistencies between form definitions and data models. UI metadata should be managed as a DSL independent of the data model, and by keeping the rendering process and UI definitions loosely coupled, the system maintains a configuration that is resilient to changes and highly reusable.

Regarding input validation and error handling, the fundamental policy is to manage these centrally, using the schema as the single source of truth. Avoid implementing logic directly within individual components; instead, control error classification and recovery workflows through common error handlers and models. React components must be responsible only for rendering the received UI model, and it is critical that they do not contain business logic or validation rules internally. When adding new widgets or mappings in the future, please adhere to these policies and ensure you do not deviate from the principles of declarative UI definition and automated state initialization.

## Public API

- Automated Form Generation - Constructs UI form configurations and initial data states directly from structural data schemas.
- Schema-Driven Validation - Validates user inputs against predefined CRUD schema constraints to maintain data integrity within forms.
- UI Error Orchestration - Provides a consistent mechanism to categorize, display, and handle UI-related errors with support for custom retry behaviors.
- Component Rendering Infrastructure - Enables the registration and association of custom React components with form field types via a centralized renderer registry.

## License

MIT