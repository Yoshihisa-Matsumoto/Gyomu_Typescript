# Gyomu Concept

US English | [JP 日本語](README.ja.md)

## Overview

This package functions as an orchestration layer designed to transform raw source code and dependency information into coherent project models. By representing a project’s architecture, design intentions, and operational knowledge through structured models, it bridges the gap between technical artifacts and human understanding.

Its mission is to facilitate the creation and maintenance of these models, serving as a unified knowledge base for both humans and AI. By integrating automated code analysis with curated human insights, the package ensures project knowledge remains consistent and evolves alongside the codebase. It acts as a foundation for effective communication and long-term architectural integrity throughout the development lifecycle.

## Architecture

The architecture of `@gyomu/concept` is organized into three specialized domains that facilitate the transition from raw source code to comprehensive architectural documentation. The `src/package` and `src/directory` components function as the analytical engine, responsible for inspecting source structures, resolving export targets, and synthesizing persistent conceptual models from project metadata and dependency relationships.

Once structural data is established, the `src/readme` component acts as the orchestration layer for documentation. It consumes the synthesized models to assemble, localize, and render project documentation. This process relies on a dedicated build context that manages the transformation of markdown content into finalized output. Throughout the lifecycle, integrated validation flows ensure that the generated documentation remains structurally consistent with the underlying conceptual models, maintaining integrity between the project's physical implementation and its documented architecture.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/concept
```

## Dependencies

This package requires an ESM environment and is built specifically for Effect 4.x. It relies on the Effect ecosystem for runtime, schema validation, and dependency injection.

Core functionality is powered by several internal libraries, including `@gyomu/schema` for shared type definitions, `@gyomu/infra` for foundational I/O operations, and `@gyomu/ai-compiler` for LLM-integrated tasks. Ensure your project is configured for Effect 4.x before installation to maintain compatibility.

## Development

`@gyomu/concept` is designed to function as the authoritative bridge between evolving source code and the structural intent of a project, transforming raw files into a persistent, structured knowledge model. Contributors must prioritize the integrity of this model, ensuring it remains a technology-agnostic representation that integrates both derived code metadata and human-authored design intent. The package operates on the principle that knowledge must be stored in a unified structure rather than scattered across legacy documentation; therefore, all contributions should reinforce the goal of maintaining this central, persistent model as the single source of truth for architectural and operational intelligence.

Development within this package must strictly adhere to the separation of concerns between source analysis, concept synthesis, and documentation generation. When modifying the codebase, contributors must ensure that the structural integrity of the `Concept` is preserved across all levels of granularity—from individual packages to the entire project—while maintaining the provenance of data. New features or improvements must support the automated reconciliation of human-managed knowledge with code-derived metadata, ensuring the system remains extensible for continuous, diff-based updates rather than relying on monolithic generation flows.

## Public API

- Package Conceptualization - Analyzes project environments to build structured models of package dependencies, exports, and architectural intent.
- Directory Analysis - Recursively evaluates directory contents to generate metadata that describes the structural role of individual code units.
- Automated Documentation - Generates, localizes, and renders Markdown documentation directly from the derived conceptual models of the codebase.

## License

MIT