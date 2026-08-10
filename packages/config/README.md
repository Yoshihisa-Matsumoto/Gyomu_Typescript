# Gyomu Config

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the centralized configuration platform for the Gyomu project. It provides a robust mechanism to manage, merge, and resolve application settings across global, user, and scoped sources. By implementing hierarchical resolution, the system ensures consistent configuration management throughout the entire application. It leverages functional programming principles and Effect Schema validation to transform raw inputs into reliable, type-safe data structures. This approach guarantees that all consumers receive validated settings, maintaining type safety and operational integrity across the project ecosystem.

## Architecture

The architecture is organized around a core Configuration Resolution Service that acts as the primary entry point for managing application settings. This service orchestrates the retrieval process by aggregating data from global, user, and scoped sources, applying strict precedence and merging logic to generate a coherent, type-safe application state. Throughout this lifecycle, the service performs validation to ensure configuration integrity before delivering results to the application. To support robust operations, the package features a dedicated error management layer. This component captures, categorizes, and provides context for failures that occur during the resolution process. By mapping errors to specific lifecycle phases and attaching metadata, the system enables consumers to assess the fault-tolerance and retryability of configuration lookups, ensuring reliable state management even when resolution encounters disruptions.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/config
```

## Dependencies

This package requires Node.js and is designed for ESM environments, with full compatibility for Effect 4.x. It leverages Effect as its core runtime, schema, and context foundation. Functionality is built upon the @gyomu/schema and @gyomu/infra libraries to handle shared types and infrastructure-level I/O operations. Ensure these dependencies are included in your project environment to support the package's architecture.

## Development

This package is designed as a centralized foundation to ensure reliable configuration management for the Gyomu project. Its purpose is to resolve configurations provided from multiple scopes—such as global and user—hierarchically to construct a single, consistent application state. Contributors must strictly avoid direct access to configuration sources and ensure that all configuration retrieval is performed via `ConfigResolver` to maintain complete control and abstraction of access paths.

The core of the architecture lies in achieving both "type safety through validation" and a "declarative resolution process" using Effect Schema. Since configurations are always validated during the retrieval process, invalid configuration values are prevented from leaking into the application. When extending, design the system to allow for the addition of new configuration types or scopes in a pluggable manner while maintaining existing API designs. Furthermore, when failures occur during configuration resolution, they must be represented as structured errors containing metadata necessary for diagnostics, rather than simple exceptions, to improve system robustness and ease of debugging.

## Public API

- Configuration Resolution Service - Provides a primary interface for querying and obtaining application settings based on specific resolution criteria.
- Hierarchical Merging - Automates the aggregation of configuration data across different scopes, ensuring consistent precedence between global, user, and functional contexts.
- Fault-Tolerant Resolution - Offers rich error context and lifecycle tracking to allow consumers to handle resolution failures and determine retriability.

## License

MIT