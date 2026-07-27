# Gyomu TSDoc

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust automation framework for managing and synchronizing JSDoc documentation within TypeScript projects. As a dedicated documentation management foundation for Gyomu, it ensures that source code and TSDoc comments remain continuously aligned.

The system orchestrates the documentation lifecycle by tracking project state through persistent snapshots and applying calculated updates. By decoupling documentation generation, change detection, and update application, it provides a safe, reproducible, and highly maintainable approach to managing code documentation. This ensures that documentation accurately reflects source code changes automatically, reducing the burden of manual maintenance.

## Architecture

The package architecture is organized into distinct domains that manage the lifecycle of documentation synchronization. A root entry point orchestrates the integration between snapshot management, path utility services, and the documentation update engine. This modular design ensures that state tracking, file resolution, and code modification remain decoupled yet interoperable.

The snapshot component provides deterministic tracking by maintaining persistent project state through file hashes and workspace identifiers. It identifies structural changes by comparing current snapshots against historical data, which serves as the trigger for documentation updates.

Path utilities provide a foundational layer, ensuring reliable bidirectional mapping between source files and build artifacts. This normalization is critical for both the snapshotting process and the update engine. Finally, the update component manages the orchestration of JSDoc lifecycle events. It transforms code analysis data into structured documentation, reconciling new content with existing source files through a planned series of edits, ensuring that documentation remains synchronized with project evolution.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/tsdoc
```

## Dependencies

This package is designed for ESM environments and requires Effect 4.x or later. It relies on the Effect ecosystem for its core runtime, schema management, and context handling.

Functionality is built upon internal infrastructure libraries, including `@gyomu/schema` for shared types and `@gyomu/infra` for foundational I/O operations. Additionally, `@gyomu/ai-compiler` is utilized to facilitate LLM-driven tasks such as concept generation.

## Development

This package is designed as a structured foundation for managing source code documentation within Gyomu. Its primary purpose is to ensure that TypeScript code and TSDoc comments remain in a state of continuous synchronization, effectively transforming documentation from a static artifact into a dynamic, version-controlled component of the codebase. By treating TSDoc as an integral part of the source code structure, the system guarantees that documentation evolves alongside logic, maintaining high fidelity between the implementation and its descriptive metadata.

Architecturally, the package enforces a strict separation between the planning of documentation updates and their physical application to source files. To maintain this, contributors must ensure that all processes operate through a persistent Snapshot mechanism, which captures project states to enable accurate change detection and minimal, targeted updates. Every operation—from file path resolution to the injection of formatted JSDoc—must adhere to normalized path models to ensure reliability across complex environments, including monorepos. Developers should prioritize modularity, ensuring that documentation generation, change detection, and reconciliation remain decoupled to provide a predictable, verifiable, and reproducible workflow for long-term maintenance.

## Public API

- Project State Tracking - Enables the capture, commitment, and comparison of project file snapshots to detect structural changes over time.
- Documentation Update Orchestration - Automates the planning, merging, and application of JSDoc updates, ensuring documentation remains synchronized with code changes.
- Path Management Utilities - Provides tools for normalizing file paths and mapping between source and build output locations to support consistent file-based operations.

## License

MIT