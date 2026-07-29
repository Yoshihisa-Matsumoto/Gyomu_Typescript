# Gyomu AI

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the AI execution infrastructure for the Gyomu project, providing a modular and resilient framework for orchestrating AI interactions within TypeScript applications. Its mission is to standardize AI integration by abstracting differences between various providers and SDKs.

By offering a unified interface for model management, intelligent request routing, and structured tool execution, the package ensures consistent and testable behavior across complex workflows. This approach promotes reliable, scalable, and maintainable AI application development by centralizing error handling and automating system fallbacks, ultimately streamlining the deployment of robust intelligence features.

## Architecture

The package architecture is organized into a modular framework that separates model management, request orchestration, tool execution, and error handling. This design utilizes a dependency-injected execution environment, leveraging Effect services to ensure robust and testable integration across all AI operations.

The model management layer serves as the central registry, providing structured access to language and embedding models. These models are consumed by the routing layer, which manages request flow and automated fallback strategies to ensure resilience. The tool execution layer complements this by establishing standardized interfaces and lifecycle contracts for AI-integrated capabilities, including authorization and execution policies. 

Underpinning these operations, a centralized error handling system categorizes failures by lifecycle phase and operational context. This provides structured diagnostics and consistent metadata across the entire stack, enabling clear traceability from model retrieval and request routing through to final tool execution.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai
```

## Dependencies

This package requires a Node.js environment supporting ESM and is built upon Effect 4.x. To ensure full compatibility, please ensure your project is configured to handle modern ECMAScript modules and the latest Effect ecosystem patterns.

Core functionality relies on the Effect runtime, supplemented by `@gyomu/schema` for shared definitions and `@gyomu/infra` for baseline I/O operations. Additionally, `@gyomu/approval-core` is integrated to provide the necessary approval workflows for AI-driven processes.

## Development

This package serves as the AI execution infrastructure for the Gyomu project, aiming to transparently absorb differences between various AI providers and SDKs while providing a unified interface. The core of the design is "loose coupling through abstraction"; access to AI models must be performed via `AiService` and the provided `Provider`. Developers are prohibited from using provider-specific SDKs directly. All model configurations are aggregated and managed in the `Registry`, eliminating direct management on the application side and ensuring maintainability across the system.

To maintain architectural reliability and scalability, all AI requests are processed through `Routing`, and a fallback configuration to prevent single points of failure is strongly recommended. Additionally, the construction of an execution environment via dependency injection using Effect services, and thorough structured error handling, maximize diagnostic capabilities during operation. When introducing Tools, contributors are required to explicitly define input schemas and execution policies, and ensure the safety and robustness of the execution environment by not trusting AI output and performing schema validation as necessary.

## Public API

- Model Registry Management - Centralized registration and retrieval of language and embedding models, allowing for consistent model configuration and injection.
- Resilient Request Routing - Advanced routing logic that enables defining chains of model nodes, allowing systems to automatically fail over to alternative configurations during execution.
- AI Tooling Framework - Standardized architecture for defining tools, including schema-based input validation, execution context management, and security via approval policies.
- Provider Abstraction - Pluggable provider architecture that wraps lower-level SDKs to maintain consistent behavior across different model backends and vendors.

## License

MIT