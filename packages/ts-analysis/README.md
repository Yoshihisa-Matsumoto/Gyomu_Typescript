# Gyomu TS Analysis

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust TypeScript static analysis and workspace discovery pipeline designed to support Gyomu. Its primary purpose is to statically analyze entire projects to extract source code structures, symbols, and dependencies into a structured analysis model. By managing filesystem caching and path resolution, the package enables developers to initialize project contexts and analyze both source files and package metadata. The resulting analysis data is managed in a persistent and reusable format, establishing a common analysis foundation that upper layers—such as artificial intelligence and document generation tools—can reliably utilize.

## Architecture

The package is organized around a core static analysis pipeline supported by specialized modules for workspace discovery, path management, and result persistence. Its architecture divides responsibilities across collaborating components that handle environment setup, file inspection, and transformation.

The analysis engine orchestrates the inspection of TypeScript source files and manages project-wide context, relying on a persistence layer to cache analysis metadata on the filesystem for incremental workflows. Concurrently, workspace and project discovery components locate configurations and package metadata to establish a comprehensive view of the environment.

A shared utilities layer underpins these operations by handling path normalization, absolute-to-relative translations, and module specifier mapping between source files and build outputs. The root interface aggregates these capabilities, exposing a unified entry point for consumers.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ts-analysis
```

## Dependencies

This package requires an ESM environment and is built for Effect version 4.x. It relies on the Effect runtime and schema for its core foundation, alongside `@gyomu/schema` for shared types and `@gyomu/infra` for I/O operations. Additionally, it uses `ts-morph` for TypeScript code analysis.

## Development

The TypeScript source code analysis infrastructure in Gyomu statically analyzes the entire project, extracts and persists source code structures, symbols, and dependencies as a structured analysis model, and provides a common analysis foundation used by upper layers such as AI and document generation. In this infrastructure, analysis results are always deterministically derived from the source code and are treated as read-only without modifying the source code. In addition, it explicitly manages TypeScript project boundaries and strictly enforces a design where upper layers use only the analysis results and do not directly depend on internal implementations such as `ts-morph`. As an architectural principle that contributors must follow, project analysis and file analysis are designed as independent responsibilities. Analysis results are managed via a persistence layer, supporting efficient workflows by enabling incremental updates and reuse. Furthermore, path resolution follows consistent rules across the entire Workspace, and module resolution and analysis processing are designed to be loosely coupled, maintaining a structure where each component can be independently extended and verified.

## Public API

- TypeScript Static Analysis - Inspects and processes TypeScript source files to extract semantic information, symbols, and code structures.
- Project and Workspace Discovery - Locates and analyzes workspace projects, package configurations, and dependency catalogs to build a complete project environment view.
- Analysis Persistence - Saves and retrieves file analysis results to and from disk for efficient caching and incremental operations.
- Path Resolution and Mapping - Normalizes paths, translates between absolute and relative locations, and maps module specifiers and build outputs to source files.

## License

MIT