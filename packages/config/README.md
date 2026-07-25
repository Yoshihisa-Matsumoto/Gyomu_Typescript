# Gyomu Config

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the centralized configuration management system for the Gyomu project. It orchestrates the retrieval, validation, and hierarchical merging of settings across global and user-specific scopes to ensure consistent application behavior.

By integrating Effect Schema for rigorous validation, the platform transforms raw configuration data into type-safe, environment-aware results. This approach guarantees type safety and reliability, providing a robust foundation that enforces uniform configuration standards throughout the entire application ecosystem.

## Architecture

The @gyomu/config package is organized as a centralized management system that orchestrates the lifecycle of configuration resolution. It uses a core resolution service to retrieve, validate, and merge settings from global, user, and scope-based sources into a coherent, type-safe structure. This service acts as the primary entry point, applying hierarchical precedence rules and schema validation to ensure data integrity before exposing values to the application.

To support this process, the package includes a specialized error-handling layer that captures, categorizes, and reports failures. This component tracks resolution phases and attaches diagnostic metadata to errors, enabling the system to identify the specific stage of failure and determine potential recovery actions. By decoupling core resolution logic from diagnostic reporting, the architecture ensures that configuration state is managed reliably and failures are transparently handled throughout the application lifecycle.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/config
```

## Dependencies

This package requires Node.js and is designed specifically for ESM environments. It is built to be compatible with Effect 4.x, leveraging its runtime, schema, and context capabilities as the core foundation.

Functionality is extended through integration with `@gyomu/schema` for shared types and schema definitions, alongside `@gyomu/infra` for baseline I/O operations. Users should ensure these peer dependencies are configured within their project to support the library's infrastructure.

## Development

The development philosophy of this package is rooted in creating correct-by-construction systems, where configuration is treated not as a passive collection of key-value pairs, but as a formal data contract. By leveraging Effect Schema, we enforce strict type safety and runtime validation at the earliest possible boundary, ensuring that invalid configurations are rejected before they can propagate into the application’s business logic. This approach transforms configuration from a common source of runtime bugs into a predictable, immutable infrastructure layer that guarantees the integrity of the environment regardless of the complexity of the hierarchical inheritance.

We architect this platform with a clear separation between the resolution strategy—the "how" of merging disparate layers—and the consumption API, the "what" of application integration. Contributors should prioritize extensibility and modularity, ensuring that new configuration sources or resolution rules can be added without modifying core logic. Adherence to functional purity is essential; state management and error handling must be predictable, providing rich, traceable metadata for any resolution failure. By maintaining this strict separation and rigorous internal consistency, we ensure that the system remains resilient, maintainable, and strictly typed as Gyomu scales across global user scopes.

## Public API

- Configuration Resolution - Orchestrates the multi-layered retrieval of settings by applying precedence rules across global, user, and scope definitions.
- Typed Configuration Access - Exposes a service interface that delivers validated and type-safe configuration data to application components.
- Resolution Diagnostics - Provides structured error context to help developers troubleshoot and identify failure points during the configuration lookup process.

## License

MIT