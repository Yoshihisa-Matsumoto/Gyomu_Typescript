# Gyomu Config

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a centralized configuration management system designed to offer a robust infrastructure for the Gyomu project. It orchestrates the retrieval, validation, and hierarchical merging of settings from multiple sources, ensuring a consistent approach to configuration management across the entire application.

By resolving configuration settings based on global and user scopes, the system enforces structural integrity through rigorous validation using Effect Schema. This approach delivers a fully type-safe configuration, enabling reliable and predictable behavior throughout the software ecosystem.

## Architecture

The architecture of `@gyomu/config` is built around a centralized resolution service that manages the lifecycle of configuration settings. This core component orchestrates the retrieval, hierarchical merging, and schema-based validation of configurations sourced from global, user, and scope-specific levels. By consuming resolution criteria, the service ensures that application settings are consolidated into a type-safe structure that maintains integrity throughout the lifecycle.

The package is organized to separate orchestration logic from error handling. The primary service layer coordinates the resolution process, while the dedicated error management module provides a structured framework for categorizing and diagnosing failures. By capturing granular metadata and identifying specific phases of the resolution process where issues occur, this architecture enables precise error reporting. Together, these components ensure that configuration retrieval is predictable, maintainable, and resilient.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/config
```

## Dependencies

This package requires an ESM environment and is designed for compatibility with Effect 4.x. It serves as an extension built upon the Effect ecosystem, utilizing `@gyomu/schema` for shared type definitions and `@gyomu/infra` for foundational I/O operations. Ensure your project is configured to support these runtime requirements before installation.

## Development

The Gyomu configuration management infrastructure is designed to integrate hierarchical structures of global and user scopes, providing consistent configuration resolution throughout the application. The core of the design lies in aggregating settings from multiple sources, validating them strictly using Effect Schema, and providing them to the application in a type-safe manner. Developers must maintain a design where settings are retrieved only through the provided `ConfigResolver` service, rather than accessing configuration sources directly. This convention centralizes control over the configuration resolution lifecycle and ensures system consistency.

Contributors should construct configuration resolution processes as declarative pipelines and strive to minimize side effects. When adding configurations or extending scopes, it is required to maintain the existing API while ensuring that the type-safe and immutable design is not compromised. Furthermore, upon configuration retrieval failure, structured errors must always be returned to provide metadata that enables diagnosis and recovery. By adhering to these architectural principles, we aim to maintain future extensibility while continuously improving the robustness of the system.

## Public API

- Configuration Resolution - Orchestrates the multi-layered retrieval of settings by applying precedence rules across global, user, and scope definitions.
- Typed Configuration Access - Exposes a service interface that delivers validated and type-safe configuration data to application components.
- Resolution Diagnostics - Provides structured error context to help developers troubleshoot and identify failure points during the configuration lookup process.

## License

MIT