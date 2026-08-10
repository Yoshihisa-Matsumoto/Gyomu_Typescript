# Gyomu AI

## Repository Overview

The `@gyomu/ai` package functions as the core AI integration layer for the Gyomu project, providing the execution foundation for AI applications. Its primary responsibility is to absorb differences across AI providers and SDKs, offering unified interfaces for model management, request routing, and tool execution. By standardizing error handling and leveraging Effect-based dependency injection, the package establishes a reliable, extensible, and maintainable architecture for text generation, structured object mapping, and embeddings.

## Package Responsibilities

- Manage AI model registries and dependency injection layers for language and embedding models.
- Orchestrate AI request routing and failover strategies using structured route nodes.
- Define tool execution standards, context models, and integration policies.
- Provide domain-specific error handling and structured diagnostics for AI operations.

## Architecture

The package is structured hierarchically with `src` serving as the root entry point and integration hub that exports public APIs and aggregates core sub-modules. 

- **`src/routing`**: Orchestrates AI model request execution by mapping identifiers to configurations, managing execution sequences across route nodes, and implementing fallback error-handling logic. It consumes models to perform operations.
- **`src/model`**: Centralizes AI model definition, identification, and registry management. It provides accessors for language and embedding models, utilizing effect layers for dependency injection.
- **`src/tool`**: Defines core abstractions, interfaces (`AiTool`), execution contexts, and approval policies for creating and managing AI-integrated tools.
- **`src/error`**: Centralizes domain-specific error classes, retryability categories, and diagnostic context interfaces for consistent failure handling across operations.

## Design Principles

- Access all AI models exclusively through AiService and related services while strictly prohibiting the direct use or exposure of provider-specific SDKs to prevent vendor lock-in.
- Centralize model configurations within a dedicated Registry to keep consumer implementations simple and prevent hardcoded model setups.
- Standardize AI requests through Routing with built-in fallback mechanisms to ensure high availability and resilience against provider failures.
- Define tools with explicit input schemas, execution policies, and clear management of side effects and permissions to enable secure and reusable AI integration.
- Treat all AI outputs as untrusted by enforcing schema validation and structuring errors to preserve diagnostic information for predictable execution.

## Important Constraints

- Do not depend on a specific AI provider's API.
- Do not expose provider-specific SDKs to consumers.
- Do not hardcode AI model configurations directly in the code.
- Explicitly manage side effects and permissions for tools.
- Do not implement business logic unrelated to AI calls.
- Preserve the existing public export structure (`.` and `./provider/vercel`).

## Editing Rules

- Use Effect Schema for persisted and externally exchanged data structures.
- Design structured models instead of free-form strings whenever possible.
- Keep analysis, concept generation, document generation, and rendering loosely coupled.
- Do not introduce circular dependencies between packages.
- Represent effectful operations using Effect.
- Represent errors in the Effect error channel instead of throwing exceptions.
- Validate AI-generated data with Effect Schema before use.
- Do not depend on AI provider-specific APIs outside the Infrastructure layer.
- Generate documentation from structured data such as concepts whenever possible.
- Avoid duplicating the same knowledge across multiple documents.
- Depend only on public APIs of other packages and avoid internal implementation details.
- Consolidate shareable logic into existing shared packages to avoid duplicate implementations.
- Update or add tests whenever observable behavior changes.
- Keep tests deterministic and independent of external services.
- Treat human-managed knowledge and code-derived knowledge as independent sources.
- Generate documents via the Document model instead of directly assembling Markdown strings.

## Navigation

This document provides a high-level overview of the package concept, responsibilities, and design decisions.

For more detailed information, refer to the following documents:



- **Architecture Documentation**
  Describes the internal architecture, major components, dependencies, and design decisions of this package.
- **API Reference**
  Describes public APIs, exported modules, and usage patterns.

- **Technical Documentation**
  Describes technical details, configuration, dependencies, and implementation-specific information.

- **Development Guide**
  Describes development workflows, coding conventions, testing strategies, and contribution guidelines.

- **Project Knowledge**
  Contains additional knowledge maintained by developers, including constraints, rationale, terminology, and operational guidelines.


When modifying this package, review the relevant documentation before making changes to preserve the intended responsibilities and architectural boundaries.