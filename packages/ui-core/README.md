# Gyomu UI Core

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust foundation for building consistent user interfaces within the Gyomu ecosystem. By bridging the gap between raw data schemas and interactive components, it enables the automated generation of forms and complex UI structures.

The framework centralizes input validation, error management, and rendering logic into a unified model. This approach effectively decouples UI implementation from data modeling, ensuring that applications remain type-safe, maintainable, and visually consistent across the entire platform.

## Architecture

The architecture of `@gyomu/ui-core` is organized into a modular system that bridges data schemas and interactive UI components. At its core, the package relies on a Domain-Specific Language (DSL) layer that transforms structural schemas into form metadata, serving as the foundational configuration for the entire library.

This metadata is processed by the form engine, which orchestrates the generation of form structures. The engine handles lifecycle management, including initializing default values, mapping widget types, and validating user input against defined constraints. This ensures a consistent approach to form rendering and data integrity.

Supporting these operations is a centralized error management system. This infrastructure categorizes UI-related errors and executes standardized recovery strategies, providing a unified mechanism for handling validation and processing faults. The root orchestration layer integrates these components, exposing a cohesive interface that allows consumers to define, render, and manage dynamic forms while maintaining consistent error handling across the application.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ui-core
```

## Dependencies

This package is designed for ESM environments and requires Node.js compatible with React 19 and Effect 4.x. It serves as a lightweight integration layer built upon the Effect ecosystem, including Effect Schema and Context, to provide type-safe runtime operations.

Core functionality relies on the `effect` library for core runtimes and `@gyomu/schema` for shared definitions and common types. Ensure your project environment is configured to support these ESM-based dependencies before installation.

## Development

This package aims to provide a common foundation for UI in Gyomu, with a mechanism to automatically derive forms and UI structures from data schemas. The design is based on the principle that 'UI is a structure derivable from a schema,' strictly separating the data model from the UI implementation to ensure type safety across the entire system. Contributors must manage UI definitions as a DSL independent of the data model and maintain loose coupling between rendering logic and UI definitions. This enables a flexible architecture where UI changes do not unnecessarily affect data structures.

During development, ensure the data schema remains the sole standard for input validation, and avoid distributing validation logic across individual components. Regarding error handling, direct implementation in components is prohibited; the use of a centralized handler based on a common model is mandatory. React components should be limited to faithfully rendering the provided UI model, maintaining a clear separation of logic. Adhering to these design principles allows for consistent behavior and robust error management across Gyomu, even for large-scale forms and complex UI structures.

## Public API

- Automated Form Generation - Enables the dynamic creation of form structures and field metadata directly from structural schema definitions.
- Schema-Driven Validation - Provides mechanisms to validate field inputs and complete form states against CRUD-compliant schemas.
- UI Error Orchestration - Standardizes how UI errors are categorized, configured, and handled, including support for retry logic and user feedback.
- Component Rendering Framework - Maps widget configurations to specific React components, enabling consistent rendering and interaction handling.

## License

MIT