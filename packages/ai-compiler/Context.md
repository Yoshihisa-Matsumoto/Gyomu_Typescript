# Gyomu AI Compiler

## Repository Overview

The `@gyomu/ai-compiler` package serves as the AI code intelligence infrastructure for the Gyomu project, providing compilation and code intelligence pipelines driven by AI models. Its primary responsibility is to build and execute AI processing tasks—such as source code analysis, document generation, and code summarization—as declarative pipelines. 

By structuring these automated workflows declaratively, the package ensures consistent, reproducible, and maintainable AI-assisted development operations across codebases.

## Package Responsibilities

- Define schemas and context models for code transformation and documentation tasks.
- Execute AI-driven pipelines for generating JSDoc updates, file summaries, and directory concepts.
- Provide strategy and mode resolution for determining the complexity and depth of code transformations.
- Implement translation strategies for various documentation formats such as paragraphs, tables, and code blocks.

## Architecture

The package architecture is organized into two primary pipeline domains: `jsdoc-update` and `file-summary`.

- **`src/pipelines/jsdoc-update`**: Handles JSDoc documentation updates through three structural areas:
  - `context`: Manages data structures, metadata, and the hierarchical `SchemaStructureNode` representation of symbols, file information, and documentability states.
  - `schema`: Defines structured update plans, merge actions, safety assessments, and reasoning traces for modifying codebase documentation.
  - `mode`: Resolves execution strategies by evaluating symbol complexity against the execution context.

- **`src/pipelines/file-summary`**: Manages file-level analysis through two structural areas:
  - `context`: Defines input interfaces and data structures, including file concept inputs and symbol summaries, to represent source code elements.
  - `executor`: Provides the operational execution logic, validation, and test suites for generating file summaries.

## Design Principles

- Structure AI processing as independent, reusable pipelines to enable modular composition and prevent internal state sharing between pipelines.
- Enforce type safety across all AI interactions by treating schemas as strict contracts and strictly validating all AI outputs before utilization.
- Strictly separate analysis from planning to ensure that generation and modification concerns never mix, requiring all modifications to pass through an explicit plan.
- Decouple model configurations from processing logic by identifying AI tasks through dedicated routes.
- Support dynamic execution strategy switching based on complexity and scale, while prohibiting direct AI model calls and task-specific business logic implementation.

## Important Constraints

- Do not call AI models directly; always use `@gyomu/ai`.
- Do not rewrite source code; express all changes as plans.
- Do not share internal state between pipelines.
- Do not implement task-specific business logic.
- Do not use AI outputs without validation.

## Editing Rules

- Use Effect Schema for persisted and externally exchanged data.
- Design structured models instead of free-form strings wherever possible.
- Keep analysis, concept generation, document generation, and rendering loosely coupled.
- Avoid introducing circular dependencies between packages.
- Represent effectful operations using Effect.
- Express errors in the Effect error channel rather than throwing exceptions.
- Validate AI-generated data with Effect Schema before use.
- Do not depend on AI provider-specific APIs outside the Infrastructure layer.
- Generate documentation from structured data such as concepts whenever possible.
- Avoid duplicating the same knowledge across multiple documents.
- Depend only on public APIs of other packages.
- Consolidate shareable logic into existing shared packages to avoid duplicate implementations.
- Update or add tests when observable behavior changes.
- Keep tests deterministic and independent of external services.
- Treat human-managed knowledge and code-derived knowledge as independent sources.
- Generate documents via the Document model instead of assembling Markdown strings directly.

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