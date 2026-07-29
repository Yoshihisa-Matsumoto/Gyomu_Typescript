# Gyomu Concept

US English | [JP 日本語](README.ja.md)

## Overview

This package provides an architectural foundation for managing project knowledge by bridging the gap between raw codebase data and high-level structural models. By synthesizing automated code analysis with human-maintained insights, it creates a unified representation of project architecture, responsibilities, and design intent.

The mission is to transition from static documentation to a living, structured model that serves as a shared knowledge base for both humans and AI. This approach ensures that technical context remains consistent and maintainable throughout the project lifecycle, allowing teams to formalize complex design concepts into a reliable, evolving project model.

## Architecture

The package is structured around three primary functional domains: structural analysis, metadata management, and documentation synthesis. By decoupling these responsibilities, the architecture facilitates the transformation of raw TypeScript codebases into formal conceptual models while maintaining strict synchronization between architectural intent and physical file structure.

The analysis engine resides in the package and directory modules, which collaborate to resolve module exports, map dependencies, and define structural entities. These components extract architectural properties from the file system, validating them to ensure the resulting metadata accurately reflects the project’s composition.

Finally, the documentation module consumes these structural models to automate the generation of project assets. It orchestrates the assembly, localization, and rendering of markdown content, transforming verified architectural metadata into standardized documentation. This pipeline ensures that documentation remains consistent with the underlying codebase, supported by integrated testing that validates both content assembly and structural integrity.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/concept
```

## Dependencies

This project requires a Node.js environment supporting ESM and is built upon Effect v4. It is designed to work seamlessly with TypeScript to ensure type safety throughout the development lifecycle.

The package relies on the Effect ecosystem for its core runtime, schema management, and context handling. Additionally, it integrates with internal `@gyomu` packages—specifically `@gyomu/schema`, `@gyomu/infra`, and `@gyomu/ai-compiler`—to provide standardized infrastructure, shared data types, and LLM-driven development utilities.

## Development

@gyomu/concept is designed to define project architecture, design intent, and operational knowledge not as static "documentation," but as a "structured knowledge model" interpretable by both humans and AI. Developers manage mechanical facts extracted from source code separately from human-provided design context, integrating them within Concept to centrally manage the "truth" of project knowledge. This neutral knowledge representation serves as a foundation for transformation into any output format or language, acting as the single source of truth to maintain consistency throughout the project lifecycle.

Contributors are expected to treat source code analysis, Concept construction, and documentation generation as independent responsibilities. When constructing Concepts, treat structures at all granularities—such as packages and directories—using the same model, and maintain a design that assumes data persistence and incremental updates. By strictly maintaining and integrating the origins of both human-managed knowledge and code-derived knowledge, ensure the architecture prevents divergence between code changes and documentation, keeping project knowledge accurate and up to date.

## Public API

- Project Structural Modeling - Translates raw TypeScript directory and package structures into formal, persistent conceptual metadata.
- Automated Documentation Generation - Transforms codebase structural data into standardized, localized documentation artifacts such as README files.
- Architectural Insight Synthesis - Analyzes project dependency graphs and source exports to generate insights into package boundaries and architectural composition.

## License

MIT