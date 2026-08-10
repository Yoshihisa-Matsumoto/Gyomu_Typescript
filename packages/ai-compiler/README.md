# Gyomu AI Compiler

US English | [JP 日本語](README.ja.md)

## Overview

The package provides an AI-driven compilation and code intelligence infrastructure for the Gyomu project. Its primary purpose is to build and execute AI processing tasks, such as source code analysis, documentation generation, and code summarization, as declarative pipelines. By standardizing these automated workflows, the system enables consistent, reproducible, and maintainable AI-assisted software development. It efficiently manages complex tasks ranging from JSDoc updates and file summarization to package concept generation, document section building, and content translation.

## Architecture

The package is organized around specialized processing pipelines that divide responsibilities into distinct functional areas: context modeling, schema definition, strategy resolution, and task execution. Collaborating components coordinate to drive compilation and code intelligence tasks like JSDoc updates, file and directory summarization, concept generation, document building, and content translation.

Context management components define the foundational data structures, symbol metadata, and input schemas required to represent source code elements and documentation states. Strategy and mode resolvers evaluate code complexity and configuration context to determine processing depth, while schema definitions establish deterministic frameworks and update plans for safe content merging. 

Finally, execution components handle the operational layer, running tasks to compute file summaries, execute code transformations, and route operations to specific AI model providers.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai-compiler
```

## Dependencies

This package requires an ESM environment and is built specifically for Effect 4.x, relying on the Effect runtime, schema, and context as its core foundation. It integrates with `@gyomu/schema` for shared types and schemas, `@gyomu/infra` for foundational I/O operations, and `@gyomu/ai` to handle LLM processing.

## Development

This package, which provides the AI code intelligence infrastructure for the Gyomu project, aims to build and execute AI processes such as source code analysis, documentation generation, and code summarization as declarative pipelines, realizing AI-assisted development with excellent consistency, reproducibility, and maintainability. Contributors must configure AI processes as independent pipelines for each use case, and handle all AI inputs and outputs in a type-safe manner using schemas as contracts. In addition, the architecture is designed to switch execution strategies according to complexity and scale, and by assembling pipelines as reusable components, extensibility and maintainability are ensured.

To ensure safety and predictability, the architecture strictly requires a clear separation between Analysis and Plan, ensuring that generated content and modification changes are not mixed. AI modifications must be structured so that they are always applied safely via a Plan. Furthermore, AI tasks are identified by Route, keeping the model configuration and processing content loosely coupled. Contributors are expected to adhere to these policies, implement and evolve complexity and depth control in code transformation and document generation, and translation strategies for diverse document formats.

## Public API

- JSDoc Updates - Analyzes source code symbols and generates structural update plans to automatically add or modify JSDoc documentation.
- File and Directory Summarization - Processes source files and directories to produce cohesive summaries and concept extractions for codebases.
- AI Model Routing - Defines route identifiers and execution hooks for connecting pipeline tasks to specific AI model providers.
- Document Translation - Provides strategies for translating structured document content including bullet lists, tables, code blocks, and paragraphs.

## License

MIT