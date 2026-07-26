# Gyomu Config

US English | [JP 日本語](README.ja.md)

## Overview

This package acts as the centralized configuration management system for the Gyomu project. It provides an infrastructure for orchestrating the retrieval, hierarchical merging, and validation of settings across global and user-specific scopes.

By integrating Effect Schema for validation, the platform ensures that all configuration data is type-safe and consistent throughout the application. This approach establishes a foundation for managing configuration settings, allowing developers to maintain architectural integrity while providing reliable, validated configuration access across the entire system.

## Architecture

The package architecture is centered around a resolution service that manages the lifecycle of configuration retrieval. This service orchestrates the hierarchical merging of global, user, and scope-based sources, applying precedence rules to produce a coherent, type-safe configuration object. By centralizing this logic, the architecture ensures that all settings adhere to predefined schemas, providing a unified API for the application to access validated data.

Responsibility for diagnostic clarity is isolated within a dedicated error management component. This subsystem categorizes configuration failures by lifecycle phase and captures metadata, enabling error reporting and recovery strategies. By decoupling resolution logic from failure representation, the package maintains a separation of concerns, ensuring that the primary configuration service remains focused on orchestration while the error infrastructure provides the necessary traceability for system integrity.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/config
```

## Dependencies

This package requires a Node.js ESM environment and is compatible with Effect 4.x. It leverages Effect as its core runtime, schema, and dependency injection foundation.

Development relies on `@gyomu/schema` for shared types and definitions, alongside `@gyomu/infra` for baseline I/O operations. Ensure these core dependencies are installed in your project to support the package's underlying infrastructure.

## Development

The Gyomu Configuration Platform treats configuration as a type-safe data contract rather than a collection of environment variables. By leveraging Effect Schema, we validate configurations at the earliest point of entry, treating invalid configurations as system failures. The architecture utilizes a hierarchical resolution strategy—merging global, user, and scope-based settings—abstracted into a declarative pipeline. This ensures that the application state conforms to a schema, eliminating classes of runtime bugs related to missing or malformed configuration.

Contributors should follow the principle of "Immutable Resolution," where configuration values are resolved as functions of the provided scope, avoiding side-effect-heavy lookups. The platform is designed to be deterministic and testable; therefore, logic must remain decoupled from the underlying storage or transport layers. When designing new resolution phases, contributors must maintain a separation between raw data ingestion and the schema-driven normalization layer. This ensures that as the system evolves, the core service-based API remains stable, allowing for complex hierarchical merges while maintaining the transparency of the final, flattened configuration object.

## Public API

- Configuration Resolution - Orchestrates the multi-layered retrieval of settings by applying precedence rules across global, user, and scope definitions.
- Typed Configuration Access - Exposes a service interface that delivers validated and type-safe configuration data to application components.
- Resolution Diagnostics - Provides structured error context to help developers troubleshoot and identify failure points during the configuration lookup process.

## License

MIT