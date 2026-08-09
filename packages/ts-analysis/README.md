# Gyomu TS Analysis

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust framework for performing static analysis on TypeScript projects within the Gyomu ecosystem. It enables developers to orchestrate the exploration of workspace projects, process source files into structured metadata, and manage the persistence of analysis results. By extracting code structures, symbols, and dependencies into a unified model, the tool facilitates consistent access to project architecture. This persistent and reusable data serves as a foundational layer, allowing AI-driven services and documentation generators to reliably interpret and leverage complex codebase information.

## Architecture

The architecture is organized into a modular framework that separates project discovery, analysis orchestration, and utility support. The system uses a centralized entry point to expose core interfaces, allowing components to collaborate effectively while maintaining clear boundaries between workspace management and static analysis tasks.

Project infrastructure is handled by specialized components that discover and define the workspace scope, validating project configurations and aggregating metadata. This context is then utilized by the analysis engine, which performs source file processing and manages the persistence of metadata to the filesystem. This approach ensures that analysis operations are anchored in a consistent environment, supporting incremental processing and efficient data retrieval.

Supporting these core engines are path resolution utilities that translate between logical module specifiers, source files, and output artifacts. These shared components provide the foundational logic for mapping filesystem locations, enabling the analysis pipeline to maintain integrity across complex repository structures. By decoupling path translation and project discovery from the analysis logic, the package ensures a stable, scalable foundation for static analysis.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ts-analysis
```

## Dependencies

This package requires Node.js and is designed for an ESM environment, utilizing Effect 4.x as its core runtime. It relies on internal infrastructure packages, including `@gyomu/schema` for shared definitions and `@gyomu/infra` for foundational I/O operations. Additionally, the package integrates `ts-morph` for robust TypeScript code analysis. Please ensure your project environment is compatible with these requirements before installation.

## Development

This package serves as a TypeScript source code analysis foundation for Gyomu, aimed at comprehensively extracting the project's overall structure, symbols, and dependencies, and converting them into reusable structured data. This analysis foundation is designed to act as the single source of truth referenced directly by higher-level layers such as AI features and documentation generation. Developers should avoid direct dependencies on analysis tools like ts-morph and maintain an architecture that accesses information through the abstracted analysis result model provided by this package. In terms of design, the highest priority is the principle that analysis results must always be deterministically derived from the source code. Strictly separate the responsibilities of project analysis and file analysis, and ensure the efficiency of incremental processing by persisting analysis data to the file system, thereby enabling differential updates. While maintaining consistency in path and module resolution logic across the entire Workspace, keep these processes loosely coupled with the main analysis logic to ensure future extensibility and maintainability. Contributors must uphold the policy that analysis results are read-only with respect to the source code and must consistently manage the boundaries of TypeScript projects.

## Public API

- Project Discovery - Enables the identification and structural mapping of TypeScript projects and workspace environments.
- Static Analysis Engine - Provides core facilities to analyze TypeScript source files and extract symbols and dependency information.
- Persistence Management - Handles caching and storage of analysis results to disk for improved performance in subsequent operations.
- Path Resolution Framework - Offers utilities for normalizing, mapping, and translating paths between source files, output artifacts, and module specifiers.

## License

MIT