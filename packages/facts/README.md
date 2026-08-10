# Gyomu Facts

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the analytical engine for the Gyomu ecosystem, transforming raw project metadata into structured insights. Its primary purpose is to provide a robust foundation for capturing, referencing, and managing repository facts with strict type safety and consistency. By separating stable project definitions from ephemeral states like branches and working trees, the framework ensures that applications maintain a cohesive understanding of the development context. Through its unified provider interface, the system evaluates and ranks directory structures to determine architectural importance across the codebase, enabling developers to derive meaningful, structured intelligence from complex project environments.

## Architecture

The architecture is structured around a central orchestration layer that serves as the entry point for all analytical processes. This root layer aggregates internal modules to expose a unified interface, facilitating the conversion of raw filesystem data into structured, queryable metadata.

The core analytical logic is localized within specialized modules responsible for evaluating package structures. These components define metadata schemas and implement algorithms to calculate quantitative importance scores for directory hierarchies. By transforming filesystem information into structured facts, these modules allow for the ranking of directory significance, providing a reliable foundation for downstream architectural evaluation.

Internal collaboration ensures that analytical data flows from the extraction of package facts to the application of scoring and ranking logic. This design separates the orchestration of external queries from the specialized evaluation of structural components, maintaining a clean distinction between data modeling and the analytical assessment of project organization.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/facts
```

## Dependencies

This package is designed for Node.js environments using ESM and requires Effect 4.x as its core runtime foundation. It leverages @gyomu/schema, @gyomu/infra, and @gyomu/ts-analysis to provide robust type definitions, infrastructure handling, and TypeScript analysis capabilities. Ensure your project is configured for ESM compatibility before installation, as the package relies on modern module resolution and the Effect ecosystem's latest runtime features.

## Development

This package provides a foundation for structuring development context in the Gyomu project and offering it in a type-safe manner. Its core design principle is to conceptually separate and manage project-specific persistent information (Project Facts) from dynamic information that depends on branches or working trees (Repository Facts). This separation maintains appropriate lifecycles according to the nature of the information, enabling a design where the application can consistently understand the current state of the development environment. Developers must define all information as a common `Fact` model and treat them as a type-safe set using `FactSet`. Information must always be retrieved via `FactProvider` to prevent consumers from depending on individual implementation details. When adding new facts, ensure extensibility that does not impact existing `FactProvider` consumers, and strictly adhere to declarative, type-safe model definitions that eliminate implicit type conversions. This is required to maintain system extensibility over the long term while preserving the consistency of structured data.

## Public API

- Project Structural Analysis - Calculates metrics and metadata about project organization to enable deeper structural understanding.
- Importance Scoring - Assigns quantitative values to directory structures to determine their relative significance and priority within the project hierarchy.
- Fact Modeling - Represents the state of a package as a queryable collection of facts for use by downstream architectural tools.

## License

MIT