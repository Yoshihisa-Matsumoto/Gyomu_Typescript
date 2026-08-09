# Gyomu Schema

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the foundational framework for the Gyomu project, providing shared schemas, type definitions, and service contracts. By acting as a centralized source of truth, it ensures structural consistency and maintains robust type safety across all system components. The package facilitates seamless, decoupled collaboration between services by establishing standardized data contracts and operational error patterns. It supports complex data conversion and systematic diagnostic workflows, enabling uniform domain modeling while enforcing strict validation. Ultimately, this infrastructure provides the essential architecture required to maintain a cohesive and reliable development environment across the entire project ecosystem.

## Architecture

The architecture is organized into a layered structure that separates core infrastructure, domain-specific entity management, and advanced code analysis capabilities. The `core` directory provides foundational utilities, including standardized result patterns and JSON serialization protocols, which ensure consistent communication across all system layers. This base layer supports the application’s error infrastructure, which centralizes diagnostic context and operational policies to manage system-wide reliability. Domain logic is primarily handled within the `entity` and `schemas` directories. The `entity` layer acts as the primary configuration source, utilizing reusable field definitions to model business structures and automatically generate CRUD schema suites. This is complemented by the `schemas/gyomu` directory, which enforces specific validation rules for business processes, and the `schemas/typescript` directory, which provides robust meta-programming tools for symbol analysis and dependency mapping. Together, these components facilitate a predictable, schema-driven environment that bridges static code analysis with dynamic operational requirements.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/schema
```

## Dependencies

This package requires an ESM environment and is built specifically for Effect 4.x. It leverages Effect as its core foundation for runtime, schema, and context management, while utilizing date-fns for robust date and time utility support. Ensure your project is configured for ESM and satisfies the Effect version requirements before installation.

## Development

This package serves as the foundation for the "Common Contract" that ensures type safety and consistency across the Gyomu project. All shared data, persisted objects, and data requiring validation must be defined using Effect Schema. To optimize AI-driven code and documentation generation, comprehensive descriptions of all Annotations are required. Branded types are also centrally managed within this package to guarantee strict type integrity across package boundaries.

For service definitions, restrict the role to interfaces and Context Tags without implementation to maintain a design where each package remains loosely coupled. Any provided utilities must be implemented as pure functions with no dependencies on other packages, adhering to the principle of maintaining immutable and declarative interfaces. By strictly adhering to common structures for error types and API communication protocols, the design guidelines aim to enhance the predictability of the entire system.

## Public API

- Domain Entity Modeling - Comprehensive tools for defining complex business entities, supporting automated CRUD schema generation and structured UI annotations.
- Centralized Error Infrastructure - Consistent error classification and diagnostic context management that powers automated logging and retry logic across the system.
- TypeScript Code Analysis - Framework for introspecting TypeScript structures, including symbol analysis, JSDoc parsing, and module-level dependency mapping.
- Standardized Data Validation - Foundational validation patterns that ensure data integrity and provide developer-friendly diagnostic messages for complex schema failures.
- Public API Contract Management - Utilities for wrapping internal logic into result-based schemas with predictable success and failure responses.

## License

MIT