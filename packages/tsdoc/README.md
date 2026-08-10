# Gyomu TSDoc

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust documentation management infrastructure for Gyomu projects. By continuously synchronizing TypeScript source code with TSDoc comments, it ensures that documentation remains accurate and aligned with the evolving codebase. The system utilizes project state snapshots and advanced file change detection to orchestrate precise, automated updates. By decoupling documentation generation from change detection and application, this package provides a reliable framework that prioritizes maintainability and consistency, enabling developers to manage the documentation lifecycle with confidence and precision.

## Architecture

The architecture is organized into four core functional domains that collaborate to maintain consistent JSDoc documentation. The system relies on a snapshot mechanism to track project state through file hashing and metadata, enabling precise identification of structural changes within monorepo environments. Stable data models define project identities and workspace configurations, ensuring reliable interaction across the entire lifecycle. Centralized path utilities provide the foundation for consistent resource identification by normalizing file system paths and mapping relationships between source code and build artifacts. This mapping facilitates the orchestration of the update workflow, which manages the planning, merging, and rendering of documentation. By integrating these snapshot-based change detection processes with structured merge plans, the system ensures that JSDoc comments are accurately generated and applied to the appropriate source files. The root layer exposes these capabilities through a unified API, coordinating the interaction between state tracking and the documentation update cycle.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/tsdoc
```

## Dependencies

This package requires Node.js and is designed for an ESM environment, utilizing Effect 4.x as its core runtime. It relies on the Effect ecosystem for schema management and context handling to ensure type safety and functional architecture.

The project integrates internal foundation libraries, including `@gyomu/schema` for shared types, `@gyomu/infra` for I/O operations, and `@gyomu/ai-compiler` for LLM-driven tasks. Ensure your environment is configured for TypeScript and ESM compatibility before installation.

## Development

This package defines source code and TSDoc comments as "synchronized artifacts" rather than just text to ensure the reliability of source code documentation management in Gyomu. At the core of this design is a method for managing code state as persistent Snapshots. This allows the system to always refer to a reliable baseline when detecting changes, eliminating discrepancies between documentation and code evolution. Developers are responsible for treating source code changes as traceable events and maintaining project integrity.

As an architectural decision, the logic for generating documentation is clearly separated from the process of applying changes to the source code. Differences identified by the change detection engine are first output as an "update plan" and then reflected in the file system in a verifiable format. This pipeline structure suppresses unnecessary file operations and enables highly reproducible update processing. Even in monorepo environments, maintain a unified documentation management infrastructure across the entire project by using a normalized path model and consistent workspace metadata.

## Public API

- Project State Tracking - Enables the capturing, committing, and diffing of file system snapshots to detect changes across project iterations.
- JSDoc Automation - Automates the generation and reconciliation of JSDoc comments by applying structured merge plans to existing source files.
- Path Resolution Utilities - Provides tools for normalizing paths and mapping relationships between source files and their corresponding build artifacts.

## License

MIT