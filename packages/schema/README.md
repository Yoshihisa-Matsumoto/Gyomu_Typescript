# Gyomu Schema

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as a foundational layer for the Gyomu project, providing shared schemas, type definitions, and service contracts. By establishing a unified framework for domain-driven data modeling, it enables robust collaboration between independent modules while maintaining strict type safety and architectural consistency.

Built on the Effect ecosystem, the toolkit facilitates automatic CRUD schema generation and manages complex domain validation. It ensures data integrity and standardized API results throughout the system by enforcing a common structural contract. This approach allows disparate packages to interact seamlessly while providing developers with reliable tools for structural analysis and consistent error diagnostics.

## Architecture

The package architecture is organized into five functional domains that leverage Effect for robust, type-safe data modeling. The **Entity** and **Gyomu** modules act as the primary domain layer, defining formal business schemas and automating the generation of CRUD operations. These layers depend on **TypeScript analysis** utilities, which model code metadata to support static analysis and documentation.

Supporting these domain structures, the **Error** module provides a centralized diagnostic framework. It encapsulates error metadata and operational policies—such as retry logic and severity classification—ensuring consistent failure reporting across the system. This error strategy is integrated into the schema-based decoding process, mapping validation issues directly to the domain model.

The **Core** infrastructure layer provides the foundation for the entire package. It supplies universal utilities, including standardized result patterns, JSON structure definitions, and exhaustive type checking. By unifying these components, the package maintains structural integrity and consistent data transformation logic throughout the entire application lifecycle.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/schema
```

## Dependencies

This package requires Node.js and is designed for ESM environments. It is built on Effect 4.x and utilizes the Effect ecosystem—including Effect Runtime, Schema, and Context—as its primary foundation.

For date and time operations, the package relies on `date-fns` for robust utility support. Ensure your project environment is configured to support ESM and has the necessary Effect dependencies installed to leverage the package's functionality effectively.

## Development

The development philosophy of this package is rooted in the principle of "Contract-First Architecture," where the shared schema serves as the single source of truth for the entire Gyomu ecosystem. By centralizing core domain models and validation logic, we eliminate the fragility of manual synchronization between disparate services. This structure is designed to decouple business intent from implementation details, ensuring that TypeScript interfaces act not just as passive type definitions, but as active, verifiable blueprints that enforce consistency across the boundary of every package.

Contributors should prioritize strict type safety and immutability, treating every shared definition as an immutable contract that demands rigorous backward compatibility. The philosophy favors composition over inheritance and functional purity in data transformation, ensuring that shared utilities are side-effect-free and predictable. We adhere to a "fail-fast and explicitly" mindset: diagnostic contexts and error handling must be baked into the schema layer rather than treated as an afterthought. Ultimately, contributors must strive to minimize domain leakage; the package should remain lean, providing the foundational vocabulary for the system without assuming the specific operational requirements of any single consuming service.

## Public API

- Entity Modeling - Definition of domain entities and their fields, providing the foundation for automated schema generation and UI annotations.
- CRUD Schema Generation - Automatic creation of validated schemas for insert, update, and select operations based on central entity definitions.
- Structured Error Handling - Consistent error classification and diagnostic metadata injection across system layers with support for retryability and observability.
- TypeScript Analysis Framework - Structural modeling of TypeScript source code metadata, including symbols, dependencies, and type compositions for automated tooling.
- Validation and Conversion - Tools for decoding, transforming, and validating data inputs using Effect-based schemas and custom type guards.
- Operational Infrastructure - Foundational utilities for result handling, JSON schema structures, logging, and runtime execution environments.

## License

MIT