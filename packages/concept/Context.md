# Gyomu Concept

## Repository Overview

The `@gyomu/concept` package serves as the core engine for modeling the architectural structure of TypeScript projects. It functions as a structured representation of project knowledge, integrating analysis of source code with human-maintained insights to define architecture, responsibilities, design intent, and operational knowledge.

The package is responsible for constructing, maintaining, and leveraging these project models to ensure consistency and facilitate continuous maintenance. It automates the transformation of raw file system information into high-level conceptual models and generates documentation, providing a unified knowledge base that enables both human developers and AI systems to share a common understanding of the project.

## Package Responsibilities

- Analyze project source code to resolve package boundaries and dependency graphs.
- Synthesize raw directory and file data into persistent architectural concepts.
- Orchestrate the automated generation and localization of technical documentation.
- Validate structural conceptualizations against project metadata and defined schemas.
- Provide infrastructure for caching and retrieving project-wide conceptual models.

## Architecture

The architecture is organized into three primary functional domains:

*   **`src/package`**: Acts as the core analytical engine. It manages the lifecycle of project conceptual modeling by resolving package exports, identifying dependencies, and serializing structural data. It serves as the foundation for mapping the project's internal architecture to external configurations.
*   **`src/directory`**: Manages the low-level analysis of the file system. It derives architectural metadata from source directory structures and provides the validation and testing infrastructure necessary to ensure the accuracy of these conceptual records.
*   **`src/readme`**: Handles the transformation of conceptual data into external documentation. This domain consumes project data to orchestrate the assembly, localization, and rendering of README files, utilizing internal build contexts to ensure the structural integrity of the final documentation output.

The system is structured so that `src/package` and `src/directory` provide the foundational structural data, which is then consumed by `src/readme` to generate documentation. Dependencies are managed within `src/package` to inform the broader architectural analysis process. The `src/llm-context` directory is currently non-functional and contains no architectural components.

## Design Principles

- Concept serves as the sole, technology-neutral intermediary model to ensure unified knowledge representation across projects, packages, and directories.
- Decouple source code analysis, knowledge integration, and document generation into independent, modular responsibilities to facilitate isolated improvements and architectural flexibility.
- Preserve metadata provenance by integrating source-derived insights with manually managed knowledge while maintaining a unified schema.
- Enforce strict separation between internal model persistence and output rendering to prevent leakage of analysis logic into presentation layers.
- Maintain high-level abstraction by avoiding dependencies on specific IDEs, external AI APIs, or platform-specific features, ensuring longevity and portability.

## Important Constraints

- Maintain separation between concept generation logic and Markdown rendering logic.
- Prohibit public APIs from exposing dependencies on specific AI models.
- Prohibit dependencies on editor or IDE-specific functionality.
- Prohibit mixing project analysis logic within documentation generation routines.
- Maintain the current public export structure (`.`, `./directory`, `./llm-context`, `./package`, `./readme`).
- Use `@gyomu/schema` for defining persisted and externally exchanged data structures.
- Preserve the architectural separation between resolution logic (analysis) and reporting/rendering logic (documentation).
- Enforce schema-based validation for all serialized architectural concepts.
- Ensure all architectural metadata is persisted according to established path resolution and naming conventions.
- Prohibit business logic leakage into documentation generation builders.

## Editing Rules

- Define all persisted and externally exchanged data using Effect Schema.
- Design structured models instead of relying on unstructured strings.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Prevent circular dependencies between packages.
- Represent side effects using Effect.
- Express errors through the Effect error channel instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before usage.
- Restrict dependencies on AI provider-specific APIs to the Infrastructure layer.
- Generate documentation from structured data like Concept models.
- Eliminate redundant knowledge across documentation files.
- Depend only on public APIs of other packages.
- Consolidate shared logic into existing common packages to avoid duplicate implementations.
- Update or add tests whenever observable behavior changes.
- Keep tests deterministic and independent of external services.
- Maintain human-managed knowledge and source-derived knowledge as independent information sources.
- Generate documentation via a Document model instead of direct Markdown string manipulation.

## Navigation

This document provides a high-level overview of the package concepts, responsibilities, and design decisions. For more detailed information, refer to the following documents:

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