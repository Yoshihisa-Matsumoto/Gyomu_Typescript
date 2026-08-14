# Gyomu Schema

US English | [JP 日本語](README.ja.md)

## Overview

The `@gyomu/schema` package serves as a foundational layer for the Gyomu project, supplying shared schemas, type definitions, service definitions, and domain-agnostic utilities. Its primary purpose is to establish common contracts across packages, ensuring strict type safety and consistency while enabling decoupled collaboration. 

Built on top of Effect and Standard Schema, the framework delivers a comprehensive, domain-driven approach to validation. It provides essential error-handling structures, core entity definitions, and automated CRUD schema generators, alongside advanced tools for analyzing source code and metadata.

## Architecture

The package is organized into dedicated directories that divide responsibilities across foundational infrastructure, domain modeling, and specialized analysis. 

The core infrastructure layer provides low-level utilities, JSON schema representations, and a centralized error handling strategy. It establishes standardized result wrappers, diagnostic context, and operational policies that are utilized across the entire framework.

Domain-specific logic is managed through entity and business structure definitions. These components supply reusable field definitions, UI annotations, and date-handling routines that automatically generate complete CRUD schema suites for business entities and system configurations. 

Finally, the TypeScript analysis layer provides structural models for examining code metadata, symbols, imports, exports, and type properties, enabling uniform representation for documentation and analysis tools. Together, these components collaborate to maintain type safety, data consistency, and robust validation throughout the application.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/schema
```

## Dependencies

This package requires an ESM environment and is built specifically for Effect version 4.x, relying on the `effect` ecosystem for its core runtime, schema, and context management. Additionally, it utilizes `date-fns` for handling date and time types and utilities.

## Development

It provides schemas, type definitions, service definitions, and package-agnostic utilities shared across the entire Gyomu project. By defining common contracts between packages, it aims to serve as a foundation that enables packages to collaborate loosely while maintaining type safety and consistency.

As a design principle that contributors must follow, all data shared across packages, persisted, or requiring runtime validation must be defined as Effect Schema, and branded types should also be placed in this package so they can be shared and used. Schema annotations must be provided without omission because they are utilized not only at runtime but also for AI-generated code, documentation, and knowledge generation. Service definitions must be limited to those requiring sharing, defining only interfaces and Context Tag without implementing them. Utilities must be pure functions and must never depend on other Gyomu packages.

Furthermore, APIs should be designed to be immutable and declarative wherever possible, and error types should be structured with a common format to serve as implementation examples for other packages. Schemas, type definitions, and service definitions must always be designed with a priority on reusability, continually evolving the packages while maintaining these principles.

## Public API

- Entity Schema Generation - Defines business entity structures and automatically generates corresponding insert, update, and select CRUD schemas.
- Domain Error Handling - Provides classified application errors equipped with operational logging policies, context metadata, and retryability traits.
- TypeScript Code Analysis Schemas - Supplies rich structural models for analyzing symbols, type properties, imports, exports, and JSDoc annotations.
- Result and Validation Flow - Encapsulates operation outcomes using standardized success and failure result schemas with integrated field-level error mapping.
- Date and Time Utilities - Handles local dates, year-month periods, and business calendar transformations required by domain entities.

## License

MIT