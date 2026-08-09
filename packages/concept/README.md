# Gyomu Concept

US English | [JP 日本語](README.ja.md)

## Overview

This package acts as the primary engine for modeling the architectural structure of TypeScript projects. It functions by transforming raw file system data into structured, high-level project models that represent design intent, operational knowledge, and core responsibilities. By integrating insights derived from source code analysis with human-maintained expertise, the package creates a unified knowledge base accessible to both developers and AI. Its mission is to standardize project models as living assets rather than static documentation, ensuring architectural consistency and facilitating the continuous maintenance of complex technical knowledge throughout the project lifecycle.

## Architecture

The package is organized into specialized functional domains that collectively transform file system data into architectural models and documentation. The architecture separates the concerns of structural analysis, conceptual modeling, and automated output generation to ensure a decoupled and modular system. The core analysis layer consists of directory and package modules. The directory component identifies file-level properties and hierarchies, while the package module resolves source exports and dependencies to build comprehensive, persistent architectural models. These components collaborate by synthesizing raw metadata into formal conceptual representations that define the project’s structure. The documentation layer orchestrates the transformation of these conceptual models into developer-facing content. It utilizes a dedicated assembly pipeline to integrate project data, manage localization, and perform structural validation. By separating data acquisition from rendering, the architecture ensures that documentation remains synchronized with the evolving project structure, providing a reliable bridge between underlying source code and conceptual documentation.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/concept
```

## Dependencies

This package requires an ESM environment and is built specifically for Effect 4.x. Please ensure your project is configured to support modern JavaScript modules and the Effect runtime. The library relies on `effect` as its primary foundation for schema and context management. It integrates closely with internal infrastructure components, specifically `@gyomu/schema` for shared types, `@gyomu/infra` for I/O operations, and `@gyomu/ai-compiler` to support automated documentation and LLM-based compilation processes.

## Development

`@gyomu/concept` is designed to transform project knowledge into a structured, persistent model that serves as the source of truth for both developers and AI agents. By decoupling knowledge acquisition—via source code analysis—from documentation delivery, the package ensures that architectural insights, responsibility boundaries, and design intentions remain consistent regardless of output format. Contributors must maintain this structural integrity by ensuring the model remains neutral, allowing it to integrate machine-derived insights with human-provided metadata without losing the provenance of either. To evolve this package, contributors must enforce a strict separation of concerns between code analysis, concept construction, and documentation generation. New features should prioritize the ability to perform differential updates on persistent models, ensuring that as a project evolves, the underlying `Concept` is refined rather than recreated. All structural conceptualizations must be validated against defined schemas to preserve consistency across various granularities, from individual packages to the entire project scope. By upholding these principles, the architecture remains a robust, evolving representation of the project rather than a static document.

## Public API

- Package Conceptualization - Translates TypeScript project structures into comprehensive architectural models, identifying key components and external dependencies.
- Documentation Generation - Automates the assembly, localization, and rendering of project README files based on analyzed project data.
- Directory Analysis - Examines file system structures to produce metadata-rich representations of directory contents and internal hierarchies.

## License

MIT