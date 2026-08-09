# Gyomu TSDoc

## Repository Overview

@gyomu/tsdoc serves as the source code documentation management infrastructure for Gyomu. It maintains synchronization between TypeScript code and TSDoc comments, orchestrating the management of documentation updates triggered by source code modifications. The system utilizes project state snapshots and file change detection to manage the documentation lifecycle. By decoupling documentation generation, change detection, and update application, it ensures reproducible and maintainable documentation across TypeScript projects.

## Package Responsibilities

- Manage the lifecycle and persistence of project source file snapshots for consistent state tracking.
- Perform change detection between file snapshots to identify modified project segments.
- Orchestrate the end-to-end workflow of generating, merging, and applying documentation updates.
- Provide reliable path mapping utilities between source files and build outputs to ensure documentation coherence.
- Define stable data models for project identity and workspace metadata in monorepo environments.

## Architecture

The architecture is organized into three primary functional domains under the `src/` root, which acts as the system entry point and orchestrator for documentation maintenance.

*   **`src/snapshot/` and `src/snapshot/types/`**: This domain manages the project lifecycle and state. It defines schemas for workspace identity and file states, and implements the persistence layer for hashing and change detection. The `types` sub-directory provides the structural models, while the parent directory handles the operational logic of snapshot creation, storage, and differential analysis.
*   **`src/update/`**: This domain orchestrates documentation lifecycle workflows. It transforms analysis data into structured JSDoc, plans file-level edits, and performs the merging and rendering of documentation changes. It relies on the snapshot domain for state context and path utilities for locating target files.
*   **`src/shared/path/`**: This foundational layer provides path transformation and normalization utilities. It ensures consistent mapping between source files, build outputs, and test files, serving as a shared dependency for both snapshot tracking and documentation update operations.

These domains interact through a unified API exposed by `src/`, ensuring that snapshot-based change tracking and path mapping are synchronized during documentation update execution.

## Design Principles

- Synchronized Documentation Management: TSDoc artifacts must strictly reflect source code structures, ensuring comments remain accurate and preventing stale documentation through integrated state synchronization.
- Decoupled Processing: The documentation update lifecycle is separated into distinct phases for planning and application, enabling safety checks, human verification, and modular extensibility.
- Deterministic State Persistence: Documentation changes are managed via immutable snapshots to facilitate predictable, diff-based updates that preserve existing manual edits rather than performing unconditional overwrites.
- Environment Agnostic Design: File operations utilize normalized path models to ensure consistent performance and reliability across monorepo architectures, independent of specific directory layouts or build tooling.
- Strict Analysis Requirement: Automated updates must be derived exclusively from source code analysis, maintaining a clear traceability between code changes and generated documentation artifacts.

## Important Constraints

- Analyze source code before executing any TSDoc updates.
- Preserve existing comments rather than unconditionally overwriting them.
- Decouple documentation generation logic from file system update processing.
- Avoid dependencies on specific directory structures or build systems.
- Use `@gyomu/schema` or `effect` to define persisted and externally exchanged data models.
- Preserve the existing public export structure (15 exported symbols from `.`).
- Ensure all file system, network, and analysis operations are conducted through the orchestration of defined internal modules (`src/snapshot`, `src/update`).
- Maintain immutability of snapshot structures during change detection and persistence.
- Execute file-level edits using ordered offsets to ensure source code integrity.

## Editing Rules

- Use Effect Schema for all persisted or externally exchanged data structures.
- Design structured models instead of relying on free-form strings.
- Decouple parsing, concept generation, document generation, and rendering processes.
- Do not introduce circular dependencies between packages.
- Represent side effects using Effect.
- Use the Effect error channel for failure handling instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before use.
- Depend only on public APIs of other packages.
- Restrict dependencies on AI-provider-specific APIs to the Infrastructure layer.
- Generate documentation from structured data like Concept models rather than manual entry.
- Avoid duplicating knowledge across different documentation files.
- Aggregate common logic into existing shared packages.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and independent of external services.
- Keep human-managed knowledge and derived source-code knowledge in independent information sources.
- Generate documentation through Document models instead of manual Markdown string construction.

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