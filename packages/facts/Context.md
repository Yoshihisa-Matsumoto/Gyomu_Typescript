# Gyomu Facts

## Repository Overview

The `@gyomu/facts` package serves as the analytical engine for the Gyomu ecosystem, responsible for structuring and providing access to project metadata. It establishes a foundation for retrieving and referencing project facts in a type-safe, consistent manner. The package manages a separation between persistent project definitions and the transient state of the repository, such as branches and working trees. By leveraging a `FactProvider` to unify these data sources, the package enables applications to maintain a consistent understanding of the development context. Furthermore, it implements the logic required to evaluate, score, and rank directory structures to determine the architectural importance of various codebase components.

## Package Responsibilities

- Define the structural metadata schemas for project files and directories.
- Implement analytical algorithms to score and prioritize directory components.
- Orchestrate data transformation from raw filesystem information into high-level analytical facts.
- Provide a unified interface for querying project-wide structural metrics.

## Architecture

The architecture is organized into a root orchestration layer and a core analytical module, providing a structured approach to filesystem metadata generation.

*   **`src/`**: Acts as the root orchestration point and public interface. It aggregates functionality from internal modules, serving as the central hub for exposing analytical capabilities and coordinating project-wide structural evaluation.
*   **`src/package/`**: Contains the core analytical logic for evaluating directory hierarchies. This component is responsible for extracting package facts, calculating importance scores, and ranking directory structures.

The relationship between these areas is hierarchical; the `src/` directory delegates complex analytical tasks to `src/package/`. Internally, `src/package/` utilizes extracted package facts as the foundation for its scoring logic, which in turn supports the ranking algorithms used to determine the priority of directory structures.

## Design Principles

- Strictly separate persistent project definitions from dynamic repository states to ensure distinct lifecycles and logical isolation.
- Enforce type-safe modeling for all facts to ensure consistency and eliminate the need for implicit type conversions by consumers.
- Aggregate related facts into FactSets to maintain architectural stability as the number of supported fact types increases.
- Abstract fact retrieval through FactProvider to decouple consumption from implementation details, storage mechanisms, or source origins.
- Maintain a read-only architecture that prohibits the implementation of business logic or state-mutating operations within the fact management layer.

## Important Constraints

- Do not allow consumers of `FactProvider` to implement individual fact retrieval logic.
- Do not mix the characteristics of `Project Fact` and `Repository Fact`.
- Do not implement logic that modifies the state of the repository.
- Do not implement business logic related to projects or repositories.
- Do not implement application-specific decision-making logic within this package.
- Do not permit direct dependency on storage implementations or persistence mechanisms for `Fact`.
- Maintain exactly 3 exported symbols.
- Preserve the existing public API surface (re-exports from `.`).
- Limit dependencies to `@gyomu/infra`, `@gyomu/schema`, `@gyomu/ts-analysis`, and `effect`.

## Editing Rules

- Define all persisted and externally exchanged data structures using Effect Schema.
- Design structured data models instead of using free-form strings wherever possible.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Do not introduce circular dependencies between packages.
- Represent all side effects using Effect.
- Express errors through the Effect Error Channel instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before use.
- Avoid dependencies on specific AI provider APIs outside of the Infrastructure layer.
- Generate documentation from structured data such as Concepts.
- Avoid duplicating knowledge across different documentation files.
- Depend only on the public APIs of other packages.
- Consolidate reusable logic into existing shared packages to prevent redundant implementation.
- Update or add tests whenever observable behavior changes.
- Write deterministic tests that do not rely on external services.
- Maintain human-managed Knowledge and source-derived Knowledge as independent information sources.
- Generate documentation through the Document model instead of assembling Markdown strings directly.

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