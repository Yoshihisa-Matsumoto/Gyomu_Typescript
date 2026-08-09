# Gyomu Agent

US English | [JP 日本語](README.ja.md)

## Overview

The `@gyomu/agent` package serves as an AI-driven agent module within the Gyomu project ecosystem, acting as the foundational execution platform for agents. Its primary purpose is to combine AI models with project analysis features to build and execute declarative, extensible agent workflows. 

By integrating core AI capabilities, infrastructure, schema validation, and TypeScript documentation parsing, the package enables the execution of intelligent analysis tasks. This provides a robust foundation for advanced development support functions such as code analysis, automated generation, and automated updates.

## Architecture

The package is organized around two primary functional domains: core agent execution and automated testing infrastructure. Responsibilities are divided between orchestrating intelligent analysis tasks and providing a robust quality assurance layer. 

The source directory (`src`) serves as the central hub for the testing infrastructure. It houses validation logic and verification tools designed to ensure the reliability, stability, and correctness of the project's analytical components. Through automated test suites, this component acts as a verification layer that validates expected outputs against project inputs.

Together, these collaborating components integrate schema definitions, infrastructure components, and foundational AI capabilities to execute intelligent analysis tasks while maintaining operational stability.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/agent
```

## Dependencies

This package requires an ESM environment and is built for Effect version 4.x, utilizing the Effect runtime, schema, and context as its core foundation. It integrates with `@gyomu/schema` for shared types and schemas, and `@gyomu/infra` for foundational I/O and infrastructure operations.

## Development

This package aims to serve as the Agent execution foundation in the Gyomu project by combining AI models and project analysis features to build and execute declarative and extensible Agent workflows, providing the basis for advanced development support features such as code analysis and automatic generation. To achieve this, developers must design each Agent as an independent component based on its responsibilities, separating implementation from configuration and declaring its behavior. In addition, AI inference results must undergo schema validation as needed to ensure they are always handled as safe data, and state transitions must be managed clearly for long-running processes.

Contributors must follow strict policies regarding coupling with infrastructure. Agents must be built using Dependency Injection via Effect and must not depend directly on infrastructure. Furthermore, it is essential that Agents remain loosely coupled and be configured as reusable workflows. To maintain robustness during operation and when errors occur, errors must be structured and designed to reliably retain execution status and diagnostic information.

## Public API

- Agent Execution - Enables the orchestration and execution of AI-driven tasks leveraging core gyomu packages.
- Testing Infrastructure - Provides automated verification tools and test suites to ensure the correctness of agent operations.

## License

MIT