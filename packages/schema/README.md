# Gyomu Schema

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the foundational layer for the Gyomu ecosystem, establishing shared schemas, service definitions, and utility tools. By centralizing common contracts, it ensures consistent type safety and facilitates decoupled communication across all project components.

The framework provides a robust environment for modeling domain entities, infrastructure services, and application metadata. By leveraging Effect schemas, it enables reliable data validation and systematic error handling throughout the system. Additionally, the package includes advanced analysis capabilities for parsing and documenting TypeScript code structures, promoting maintainability and architectural coherence across the entire project.

## Architecture

The architecture is organized into five specialized modules that work together to enforce type safety, data integrity, and operational consistency. The `entity` and `gyomu` modules act as the core domain layer, defining business-specific entities and their corresponding CRUD schemas. These modules rely on structural definitions to maintain consistency across system services, task scheduling, and data transformations.

Supporting these domain models, the `schemas/typescript` module provides a framework for static analysis, enabling the systematic capture of symbols, dependencies, and code metadata. The `core` module provides the shared infrastructure, including result patterns and low-level utilities that ensure predictable communication between system layers.

Finally, the `error` module establishes a centralized strategy for diagnostics. By defining behavioral traits and operational policies, it allows the system to standardize error classification, context, and recovery logic. Together, these components create a robust, schema-driven environment where domain logic, infrastructure operations, and static analysis are unified under a consistent set of validation patterns.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/schema
```

## Dependencies

This package is designed for ESM environments and requires Effect 4.x as its core runtime. It leverages Effect for schema definition, context management, and runtime operations, while utilizing `date-fns` for robust date and time utility support. Ensure your project is configured for ESM to maintain full compatibility with these dependencies.

## Development

The Gyomu core package serves as the foundational layer for the entire project, establishing a unified contract for domain-specific business entities, service definitions, and shared utility structures. Contributors must ensure that all shared, persistent, or runtime-validated data is defined using Effect Schema, strictly adhering to the requirement that all schema annotations remain exhaustive. These annotations are critical not only for runtime validation but also as a primary source for AI-driven workflows, documentation, and code generation; therefore, they must be treated as essential metadata rather than optional documentation.

Architectural consistency is maintained by keeping services strictly limited to interface and Context Tag definitions, ensuring that implementations remain decoupled from this foundational layer. All utility code provided here must be strictly pure and remain entirely free of dependencies on other Gyomu packages to maintain architectural independence. When evolving this package, contributors should prioritize immutable and declarative API designs, ensuring that shared Brand types, error structures, and service definitions provide a robust, type-safe, and predictable interface that acts as the standard implementation reference for the rest of the project.

## Public API

- Domain Entity Modeling - Definition of business entities using structured schemas, supporting audit fields, UI annotations, and automatic generation of CRUD operations.
- Structured Error Handling - A robust system for defining domain-specific errors with consistent context, behavioral traits, and operational policies for logging and retries.
- TypeScript Analysis Framework - Foundational tools for static analysis of TypeScript code, including symbol mapping, dependency tracking, and JSDoc metadata extraction.
- Result and Validation Patterns - Standardized result schemas and utility patterns for wrapping operations, ensuring predictable communication between layers.
- Operational Lifecycle Services - Management of system lifecycles for I/O, network, and AI requests, including retry strategies, timeouts, and state tracking.
- Data Format Utilities - Advanced conversion and normalization utilities for temporal types, JSON objects, and character encodings.

## License

MIT