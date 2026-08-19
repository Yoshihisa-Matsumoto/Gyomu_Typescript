# Gyomu TS Analysis

## Repository Overview

The `@gyomu/ts-analysis` package functions as the TypeScript source code analysis infrastructure for Gyomu. Its primary responsibility is to statically analyze projects and workspaces, extracting source code structures, symbols, and dependencies into a structured analytical model. 

By managing filesystem caching, path resolution, and metadata processing, the package persists and supplies this analysis model in a reusable format. This establishes a common foundational layer that upper-layer systems, such as AI services and documentation generation tools, utilize for programmatic code intelligence.

## Package Responsibilities

- Orchestrate the static analysis pipeline for TypeScript source files and project configurations.
- Manage project context, workspace discovery, and environment metadata.
- Persist and load analysis results from storage to support caching and incremental workflows.
- Provide path normalization, transformation, and mapping between source files and build outputs.

## Architecture

The package is structured around a top-level root entry point (`src`) that exports the core static analysis pipeline and shared infrastructure utilities. 

The architecture is divided into two primary areas:
- **`src/analysis`**: Manages the static analysis pipeline. It contains `src/analysis/project`, which defines the project scope, configuration data, and context required for analysis. The analysis subsystem orchestrates file-level processing, persists and retrieves metadata, and maintains project-wide context.
- **`src/shared`**: Houses foundational utilities. `src/shared/project` handles TypeScript project discovery and workspace configuration analysis, while `src/shared/path` provides centralized path normalization, resolution, and source-to-output mapping.

The analysis subsystem relies on project configuration and workspace definitions provided by the shared infrastructure to establish its environment and boundaries.

## Design Principles

- Derive analysis results deterministically from source code without relying on AI inference or semantic reasoning to ensure consistency.
- Isolate project-level and file-level analysis into independent responsibilities while centralizing TypeScript-specific processing to maintain strict boundary separation.
- Persist analysis results immutably as read-only data, enabling incremental updates and reuse for large-scale projects without modifying the underlying source code.
- Enforce consistent path resolution across the entire workspace and maintain loose coupling between module resolution and analysis execution.
- Restrict upper layers to consuming analysis results exclusively, preventing direct dependencies on internal compiler APIs or external tools like ts-morph.

## Important Constraints

- Do not modify source code.
- Do not perform documentation generation.
- Do not implement AI-based inference or semantic analysis.
- Do not implement project-specific analysis logic.
- Do not expose TypeScript Compiler API implementation details as part of the public API.
- Preserve the existing public export paths (`.` and `./testing`) and exported symbols.

## Editing Rules

- Use Effect Schema for persisted and externally exchanged data.
- Design structured models instead of free-form strings wherever possible.
- Keep analysis, concept generation, documentation generation, and rendering loosely coupled.
- Do not introduce circular dependencies between packages.
- Represent effectful operations with Effect.
- Express errors through the Effect error channel rather than throwing exceptions.
- Validate AI-generated data with Effect Schema before use.
- Do not depend on AI provider-specific APIs outside the Infrastructure layer.
- Generate documentation from structured data such as concepts.
- Avoid duplicating the same knowledge across multiple documents.
- Depend only on public APIs of other packages.
- Consolidate shareable logic into existing shared packages to avoid duplication.
- Update or add tests when observable behavior changes.
- Keep tests deterministic and avoid depending on external services.
- Treat human-managed knowledge and code-derived knowledge as independent sources.
- Generate documents through the Document model instead of assembling Markdown strings directly.

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