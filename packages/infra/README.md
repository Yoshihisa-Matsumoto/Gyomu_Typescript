# Gyomu Infra

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the foundational infrastructure layer for the Gyomu ecosystem, providing a consistent service-oriented architecture built on Effect. Its primary purpose is to abstract common operational tasks—such as file system management, database interaction, network communication, and data serialization—into reliable, type-safe services. By centralizing these cross-cutting concerns, the package decouples application logic from platform-specific implementations and external libraries. This architecture ensures a stable, consistent environment, allowing developers to interact with shared interfaces that maintain type safety and operational integrity across all components within the ecosystem.

## Architecture

The architecture is organized as a modular, service-oriented layer built on the Effect ecosystem. It centralizes cross-cutting concerns by providing specialized modules for file system operations, database connectivity, network communication, and data serialization. This structure ensures consistent error handling and type-safe integration across the entire application ecosystem. The package divides responsibilities into distinct functional domains: file management, database repository patterns, web-based service integration, and data parsing. Each module operates through a service-layer abstraction that decouples high-level business logic from underlying platform implementations. For example, the database layer manages connection lifecycles through repository abstractions, while the web and file modules provide standardized interfaces for I/O and stream processing. Collaborating components facilitate bidirectional data transformation, enabling seamless conversion between structured domain models and external formats like CSV, XML, and JSON. By utilizing shared configuration and utility providers, these components maintain architectural consistency, allowing the infrastructure layer to act as a reliable foundation for complex service interactions and data-driven operations.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/infra
```

## Dependencies

This package requires Node.js and is designed for ESM environments, leveraging Effect 4.x as its core runtime and schema foundation. It utilizes @gyomu/schema for shared types and data validation. While the package includes integration modules for SSH, FTP, and Zip operations, these are implemented via export paths to ensure they are only loaded when explicitly imported. This ensures a lightweight runtime footprint tailored to your specific project needs.

## Development

This package aims to serve as a common infrastructure foundation for the Gyomu ecosystem, freeing application logic from platform-specific constraints. The core of the design is the strict abstraction of side effects—such as file operations, network communication, and database connections—as Effect-based services. Contributors must conceal external libraries and environment-dependent implementations behind defined service interfaces rather than introducing them directly into the application layer. This maintains a loosely coupled, testable runtime environment where replacing the infrastructure layer does not impact application logic. In implementation, prioritize type safety, robust error handling, and guaranteed data integrity. Classify all external operations based on a common error model and implement them to retain diagnostic information. At the boundaries of data transformation and external I/O, ensure consistency with domain models via schema validation. Prioritize stream-based approaches for high-volume data processing to balance scalability and resource efficiency. Design and maintain all infrastructure features as generic components, excluding dependencies on specific business requirements to ensure consistency and reusability across the entire ecosystem.

## Public API

- File System Operations - Comprehensive utilities for local file manipulation, streaming, searching, and metadata management with integrated error handling.
- Database Integration - Abstracted connectivity and repository patterns for Kysely and MSSQL, enabling type-safe CRUD and custom query execution.
- Web and Network Access - Capabilities for executing HTTP requests, downloading remote content, and processing streamed network responses.
- Data Serialization - Bidirectional conversion utilities for CSV, JSON, XML, and YAML, often integrating with schema validation to ensure data integrity.
- DOM and Scraping - Abstractions for parsing, navigating, and querying HTML content, specifically designed for document-based data extraction.
- Security and Authentication - Utilities for managing JSON Web Tokens and performing cryptographic operations like SHA-256 hashing.
- Archive Management - Support for creating, reading, and inspecting contents of TAR and ZIP archives through stream-based interfaces.

## License

MIT