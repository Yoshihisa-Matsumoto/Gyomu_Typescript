# Gyomu AI

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the foundational AI execution layer for the Gyomu project, designed to provide a unified interface for complex AI operations. By abstracting the differences between various AI providers and SDKs, it enables developers to build highly reliable, scalable, and maintainable applications.

The framework offers a modular approach to orchestrating AI interactions within TypeScript environments. It streamlines model management, intelligent request routing with automated fallbacks, and structured tool execution. This architecture ensures that AI integration remains consistent and testable, providing a robust infrastructure for developing sophisticated AI-driven solutions.

## Architecture

The architecture is organized into a modular framework that decouples model management, request orchestration, and tool execution. Central to the package is a registry-based system that abstracts AI model retrieval and configuration, providing a structured service layer for dependency injection. This foundation supports a robust routing engine that maps requests to specific models while managing automated fallback logic to ensure resilient execution.

The package enforces a standardized lifecycle for AI-integrated tools, utilizing defined interfaces and approval policies to govern execution and authorization. This is complemented by a domain-specific error management system that categorizes operational failures, providing consistent diagnostic context across all service layers. Together, these components create a cohesive pipeline where the routing layer orchestrates operations across models, tools, and error-handling utilities to maintain reliable and testable AI service integration.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai
```

## Dependencies

This package requires Node.js with ESM support and is built to integrate seamlessly with Effect 4.x. Please ensure your project environment is configured to support modern ECMAScript modules before installation.

At its core, the package relies on the Effect ecosystem for runtime management, schema definitions, and context handling. It also builds upon the internal `@gyomu` infrastructure, leveraging shared schemas, standard I/O utilities, and the `@gyomu/approval-core` library for managing AI-driven workflows requiring approval processes.

## Development

The Gyomu AI infrastructure is built on the principle of **radical abstraction through type-safe functional paradigms**. We treat AI providers—ranging from LLM APIs to custom tool execution environments—as volatile external side effects that must be decoupled from core application logic. By utilizing the Effect ecosystem, we enforce a strict separation between the definition of intent and the execution of operations. This architectural choice ensures that the complexity of multi-model routing, lifecycle management, and provider-specific quirks are entirely encapsulated, allowing developers to build features that are testable, predictable, and resilient to the inherent instability of external AI services.

Contributors to this project should adhere to a philosophy of **"uniformity over convenience."** Every addition—whether a new model integration or a tool definition—must conform to our standardized interfaces, ensuring that the system remains modular and swappable. We prioritize observability and structured error handling as first-class citizens; because AI operations are non-deterministic, we emphasize explicit failure states and robust fallback mechanisms over silent execution. Our goal is to create a rigid, high-integrity foundation where the underlying AI complexity is safely hidden, empowering engineers to extend the platform without risking the structural integrity of the broader Gyomu ecosystem.

## Public API

- Model Registry Management - Centralized registration and retrieval of language and embedding models, allowing for consistent model configuration and injection.
- Resilient Request Routing - Advanced routing logic that enables defining chains of model nodes, allowing systems to automatically fail over to alternative configurations during execution.
- AI Tooling Framework - Standardized architecture for defining tools, including schema-based input validation, execution context management, and security via approval policies.
- Provider Abstraction - Pluggable provider architecture that wraps lower-level SDKs to maintain consistent behavior across different model backends and vendors.

## License

MIT