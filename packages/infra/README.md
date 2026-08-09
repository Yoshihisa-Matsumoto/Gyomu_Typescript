# Gyomu Infra

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the core infrastructure layer for the Gyomu ecosystem, providing a robust suite of services designed for Effect-based applications. It abstracts low-level system interactions, including file management, database connectivity, network communication, and data transformation, into a unified and type-safe environment.

By decoupling application logic from platform-specific implementations and external libraries, the package establishes a stable interface for complex business operations. It enforces consistent error handling and reliable dependency injection patterns, ensuring that developers can focus on core logic while maintaining a scalable and predictable architectural foundation across the entire ecosystem.

## Architecture

The @gyomu/infra package utilizes a modular architecture to decouple business logic from runtime infrastructure. At its core, the package provides a centralized hub for environment-driven configuration and service layer definitions, facilitating consistent dependency injection across the application. By abstracting low-level system interactions into uniform wrappers, it ensures standardized error handling and predictable operational behavior. The package is organized into specialized domains that handle distinct infrastructure concerns. The file system and archive modules manage local I/O and metadata, while the database layer abstracts connection lifecycles and repository patterns. Network interactions and data serialization are handled by dedicated modules that transform raw streams into structured formats like JSON, XML, or CSV. These components collaborate by sharing configuration providers and utility layers, enabling seamless data flow between remote web sources, local storage, and database services. This modular structure allows for robust, scalable applications that remain agnostic of their underlying environment.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/infra
```

## Dependencies

This package requires Node.js and is designed for an ESM-only environment. It uses Effect 4.x as its core runtime and leverages `@gyomu/schema` for shared types and schema definitions.

The library features a modular design with specific export paths for SSH, FTP, and Zip utilities. These dependencies are loaded only when explicitly imported, ensuring that your runtime remains lightweight if those features are not required for your implementation.

## Development

The common infrastructure foundation of the Gyomu ecosystem is centered on decoupling application logic from direct dependencies on runtimes and external resources. All side effects are abstracted as Effect-based services and provided with type-safe error handling. Developers are required to avoid direct references to specific platforms or external libraries and perform infrastructure operations through defined service interfaces, maintaining a stable execution environment without polluting business logic.

When contributing to this package, prioritize data integrity and system scalability. Perform schema validation at all data transformation boundaries and adopt a stream-based approach for high-volume data processing to ensure both resource efficiency and safety. Additionally, follow the Repository pattern for database operations and properly classify and manage errors as a common, diagnosable model. Adhering to these guidelines ensures consistency across the entire Gyomu ecosystem as a highly reusable foundation independent of specific applications.

## Public API

- File System Orchestration - Comprehensive suite of operations for file and directory management, including metadata retrieval, searching, and stream-based I/O.
- Database Abstraction - Integrated services for SQL database interactions, featuring connection management, repository patterns, and custom query execution.
- Network and Web Integration - Tools for performing HTTP requests, web scraping, document parsing, and processing remote data streams.
- Data Serialization and Parsing - Bidirectional conversion capabilities between structured data models and common formats like CSV, XML, YAML, and JSON.
- Security and Authentication - Utility layer for JWT-based identity management and cryptographic operations like SHA-256 hashing.
- Archive Handling - Support for inspecting, reading, and extracting contents from ZIP and TAR archives within stream pipelines.

## License

MIT