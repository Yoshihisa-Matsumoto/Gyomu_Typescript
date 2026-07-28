# Gyomu TS Analysis

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as a foundational infrastructure for static analysis within TypeScript projects. By performing a comprehensive analysis of source code structures, symbols, and dependencies, it translates raw files into a structured, indexable model that captures the internal architecture of a codebase.

Designed to act as a robust orchestration layer, the tool bridges the gap between source code and actionable data. It manages the lifecycle of project contexts and persists analysis metadata for future use. This structured output provides a reliable common baseline for secondary applications, such as AI-driven workflows and automated documentation generation, enabling seamless integration across higher-level development tools.

## Architecture

The package architecture is organized into distinct layers that decouple project discovery from static analysis orchestration. At its core, the system utilizes a project management layer to identify workspace boundaries, validate configurations, and aggregate metadata. This foundational infrastructure establishes a unified project context that defines the scope for all subsequent operations.

The analysis pipeline builds upon this foundation to process TypeScript source files and extract structured metadata. This orchestration layer manages the entire lifecycle, from initializing the environment to persisting analysis results for incremental processing. To ensure consistency across diverse file structures, the system relies on a shared path resolution framework. This utility layer handles path normalization, module specifier mapping, and translation between source files and build artifacts, bridging the gap between raw code and indexable project data. By separating environment discovery, path management, and analysis orchestration, the architecture provides a robust interface for reliable, workspace-aware static analysis.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ts-analysis
```

## Dependencies

This package requires Node.js and is designed for an ESM environment. It relies on Effect 4.x for its core runtime, schema, and dependency injection capabilities.

The project utilizes `ts-morph` for static code analysis, alongside internal `@gyomu/schema` and `@gyomu/infra` libraries to manage shared types and infrastructure logic. Please ensure your project environment is configured to support these ESM dependencies before installation.

## Development

This package serves as the foundational analysis layer for Gyomu, tasked with transforming complex TypeScript project structures into a deterministic, structured model of symbols and dependencies. By decoupling project discovery, file-level processing, and path resolution, the architecture ensures that the analysis process remains modular and resilient to the complexities of monorepo environments. Contributors should ensure that all internal transformations adhere to a strictly read-only approach toward source code, treating the codebase as an immutable input to generate persistent, structured artifacts that serve as the single source of truth for upstream AI and documentation services.

To maintain the integrity of the analysis pipeline, all development must strictly follow the principle that analysis results are derived deterministically from the source code. The architecture mandates a clear separation between project-level discovery and file-level processing, ensuring that the system can perform incremental updates and maximize reusability through persistence. When implementing new features, prioritize the decoupling of module resolution logic from core analysis routines, and ensure that all path resolution adheres to consistent workspace-wide rules. By strictly limiting upstream dependencies to the output of this model and preventing direct reliance on internal tooling like `ts-morph`, contributors preserve the stability of the abstraction layer and ensure the platform remains maintainable as the codebase evolves.

## Public API

- Project Context Management - Initializes and maintains the environment settings, package metadata, and workspace configuration required for reliable project-wide analysis.
- Static Analysis Pipeline - Provides high-level orchestration to process TypeScript source files, extract symbol information, and store analysis results for later retrieval.
- Path Resolution Framework - Offers robust utilities for normalizing paths, resolving module specifiers, and mapping between source paths and build output locations.
- Workspace Discovery - Locates and structures TypeScript projects across a repository, allowing tooling to operate on defined workspace boundaries.

## License

MIT