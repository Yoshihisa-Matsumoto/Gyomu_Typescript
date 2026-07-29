# Gyomu Schema

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust, schema-driven foundation for domain modeling, validation, and error handling across the Gyomu ecosystem. By centralizing shared schema, type, and service definitions, it establishes a reliable communication layer that ensures data integrity and consistent cross-layer interactions.

The mission is to serve as a foundational contract that enables packages to remain decoupled while maintaining strict type safety. By leveraging the Effect ecosystem, the package standardizes business logic and automates CRUD patterns, creating a unified architecture that promotes reliability and modularity throughout the entire project.

## Architecture

The architecture is organized into five functional layers that enforce data integrity and standardized operational logic. The entity and domain schema layers serve as the central definition points, establishing the structural foundations and CRUD patterns for business models, while the TypeScript analysis layer provides the metadata required for introspection and documentation.

These components are supported by a centralized error handling system that applies consistent diagnostic traits and operational policies, such as retry and logging logic, across all system layers. The core infrastructure layer provides the low-level utility functions, including standardized result patterns and schema-based validation tools, that unify cross-layer communication. Together, these layers form a cohesive ecosystem where entity definitions, validation rules, and structural metadata collaborate to ensure type safety and consistent behavior across the application.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/schema
```

## Dependencies

This package is designed for ESM environments and requires Effect v4.x as its core runtime. It leverages Effect for type-safe schemas and dependency injection, alongside `date-fns` to provide robust handling for date and time utilities. Ensure your project is configured for ESM and satisfies the minimum version requirements for the Effect ecosystem before installation.

## Development

This package serves as a central hub for a "Common Contract" to maintain consistency and type safety across the Gyomu project. By centralizing domain schemas, branded types, and service interfaces used throughout the project, it provides a foundation that allows packages to collaborate loosely without direct dependencies, communicating instead through defined schemas. Contributors are expected to focus on making data structures and service definitions standards for the entire project, maximizing reusability.

For implementation, Effect Schema is required for all data definitions to ensure runtime validation and to provide detailed metadata for AI analysis and documentation generation. Error handling and operational infrastructure must be designed based on common traits and the Result pattern, and utilities should be implemented as pure functions with no dependencies on other packages. Service definitions are limited to interfaces and Context Tags; keeping them free of implementation details to maintain a declarative and immutable interface is the guiding principle for evolving this package.

## Public API

- Domain Entity Modeling - Enables the definition of business entities and the automatic derivation of comprehensive CRUD schemas, UI annotations, and validation logic.
- Structured Error Framework - Provides a hierarchical error system with standardized contexts, behavioral traits, and retry policies for consistent failure reporting.
- Code Analysis Engine - Offers rich structural metadata extraction for TypeScript symbols, types, and dependencies, facilitating code-aware tooling and documentation generation.
- Data Validation and Conversion - Facilitates safe transformation of input data into validated models, including sophisticated error resolution and flattening of validation issues.
- Operational Infrastructure - Provides essential utilities for system orchestration, including polling, logging, standardized result handling, and security-aware path resolution.

## License

MIT