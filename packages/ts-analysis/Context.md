# Gyomu TS Analysis

## Repository Overview

The `@gyomu/ts-analysis` package serves as the foundational static analysis infrastructure for Gyomu. It performs comprehensive analysis on TypeScript projects, extracting source code structures, symbols, and dependency relationships into a structured analysis model. By orchestrating the exploration of workspace projects and processing source files into metadata, the package manages the persistence and reuse of analysis results. This model acts as a common foundation, enabling AI-driven tools and documentation generators to consume high-level, structured insights derived from the codebase.

## Package Responsibilities

- Orchestrate the static analysis pipeline from project initialization to file-level processing.
- Manage the discovery and structural definition of TypeScript projects within a workspace.
- Provide a consistent interface for resolving and transforming file system paths relative to project and workspace roots.
- Persist analysis metadata to the filesystem to support incremental processing and efficient lookups.
- Bridge the gap between logical module specifiers and physical source code locations.

## Architecture

The architecture is organized into two primary domains: infrastructure orchestration under `src/analysis` and foundational utilities under `src/shared`.

*   **`src/analysis`**: Manages the static analysis pipeline, including project-level context initialization and file-level processing. The `src/analysis/project` component acts as the central repository for project metadata and configuration state, anchoring the analysis within defined workspace boundaries. This layer relies on filesystem persistence logic to cache analysis results and link source files to metadata.
*   **`src/shared`**: Provides essential cross-cutting concerns:
    *   `src/shared/path`: Supplies path normalization and resolution utilities, mapping logical module specifiers and source files to their physical filesystem locations.
    *   `src/shared/project`: Handles the discovery and structural identification of TypeScript projects within a workspace, extracting the metadata required to define build targets and scope.

These areas are interconnected, with `src/shared` utilities providing the environment required for `src/analysis` to identify project boundaries and resolve resources, while the root `src` directory orchestrates these components to expose unified interfaces for analysis and project management.

## Design Principles

- Deterministic derivation of analysis results ensures consistency and reliability by ensuring outputs are derived strictly from source code state without external interference or AI inference.
- Strict separation of concerns between project-level and file-level analysis maintains modularity and facilitates independent processing and scaling.
- Persistence of analysis results enables incremental updates and efficient reuse, reducing overhead in large-scale development environments.
- Decoupling of module resolution from core analysis logic isolates implementation details, preventing tight coupling to specific compiler APIs or underlying diagnostic frameworks.
- Encapsulation of TypeScript boundaries through a unified project context ensures consistent path resolution and promotes a read-only architectural pattern that prohibits source code mutation.
- Abstraction of internal analysis mechanics ensures that higher-level consumers remain agnostic of underlying implementation tools, preserving architectural integrity through clear API boundaries.

## Important Constraints

- Do not modify source code. - Do not perform document generation. - Do not implement AI-based inference or semantic analysis. - Do not implement project-specific analysis logic. - Do not expose TypeScript Compiler API implementation details in the public API. - Do not introduce new runtime dependencies outside of `@gyomu/infra`, `@gyomu/schema`, `effect`, `ts-morph`, and `dotenv`. - Preserve the existing public export structure (limit to `./` and `./testing`). - Limit the public API to exactly 22 exported symbols. - Persist analysis metadata exclusively using standard JSON serialization. - Maintain the strict decoupling between project discovery mechanisms and analysis logic. - Ensure all file system operations remain environment-agnostic via the existing path resolution utilities.

## Editing Rules

- Use Effect Schema for all data structures that require persistence or external exchange.
- Design structured models instead of relying on free-form strings.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Do not introduce circular dependencies between packages.
- Represent side effects using Effect.
- Express errors through the Effect Error Channel instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before use.
- Avoid dependencies on AI-provider-specific APIs outside the Infrastructure layer.
- Generate documentation from structured data like Concepts.
- Avoid duplicating knowledge across multiple documents.
- Depend only on public APIs of other packages.
- Consolidate reusable logic into existing shared packages to prevent duplication.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and independent of external services.
- Maintain human-managed knowledge and code-derived knowledge as independent sources.
- Generate documents via the Document model instead of manually constructing Markdown strings.

## Navigation

This document provides a high-level overview of the package concept, responsibilities, and design decisions. For more detailed information, refer to the following documents:

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