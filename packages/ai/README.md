# Gyomu AI

US English | [JP 日本語](README.ja.md)

## Overview

The `@gyomu/ai` package serves as the core AI integration layer for Gyomu projects, providing a robust execution foundation for intelligent applications. Its primary purpose is to absorb differences across various AI providers and SDKs through a unified interface. By abstracting model management, request routing, and tool execution, the package ensures high reliability, extensibility, and maintainability. It leverages Effect-based dependency injection and integrates seamlessly with standard providers to facilitate resilient text generation, structured object mapping, and embeddings.

## Architecture

The package is organized into a modular architecture that cleanly separates AI model management, request routing, tool execution, and error diagnostics. At its root, the package acts as an integration hub and public entry point, coordinating specialized sub-modules to handle operations across the AI layer.

Model management and request routing are handled by collaborating components that oversee model registries and execution paths. The model component maintains centralized definitions and dependency injection layers for language and embedding models. These models map directly into the routing component, which orchestrates request hierarchies through structured route nodes and enforces automated fallback strategies.

Tool execution and error handling are managed through dedicated components. The tool subsystem establishes standard interfaces, execution contexts, and approval policies for AI-integrated tools. Simultaneously, the error module provides structured domain errors, capturing lifecycle phases and retry states to ensure consistent diagnostics and failure recovery across all service operations.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai
```

## Dependencies

This package requires an ESM environment and is built on Effect 4.x, utilizing the Effect runtime, schema, and context for its core architecture. 

It integrates closely with internal infrastructure and domain packages—specifically `@gyomu/infra` for foundational I/O operations, `@gyomu/schema` for shared types, and `@gyomu/approval-core` for handling AI-driven approval workflows.

## Development

As the AI execution infrastructure for the Gyomu project, this package abstracts differences across AI providers and SDKs, providing model management, routing, tool execution, and error handling through a unified interface to serve as a reliable, scalable, and maintainable foundation for AI applications. To achieve this goal, contributors must restrict access to AI models through `AiService` and related services, avoiding direct use of provider-specific SDKs in favor of the abstracted providers. Furthermore, model configurations must be registered and centrally managed within the Registry, and direct management by consumers is strictly prohibited.

To ensure scalability and reliability, the architecture requires AI requests to be configured with failover considerations using Routing. When adding or implementing tools, explicit definition of input schemas and execution policies is required. Additionally, output from AI must never be trusted blindly, and designs must enforce schema validation where necessary. To maintain operational maintainability, contributors are required to avoid custom error implementations and instead design errors to be structured and retain diagnostic information.

## Public API

- AI Model Registry - Centralized definitions, lookup services, and Effect layers for managing available language and embedding models.
- Model Request Routing - Configurable routing hierarchies that map request identifiers to execution nodes and support automated fallback behaviors.
- Tool Execution and Governance - Standardized abstractions for defining AI-integrated tools, tracking active execution tasks, and evaluating approval policies.
- AI Service Integration - Provider-agnostic parameter definitions and Vercel AI SDK integrations supporting text generation, streaming, object generation, and embeddings.
- Error Diagnostics - Structured domain errors and contextual metadata capturing lifecycle phases and retry states for operational failure handling.

## License

MIT