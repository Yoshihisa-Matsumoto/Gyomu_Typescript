# Gyomu AI Compiler

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the AI code intelligence foundation for the Gyomu project. It provides a structured framework for automating complex development tasks, such as code analysis and documentation generation, by enabling the construction and execution of declarative pipelines.

By utilizing standardized schemas and consistent execution strategies, the framework ensures that AI-driven maintenance—including JSDoc updates, repository summaries, and documentation components—remains verifiable and highly maintainable. This approach prioritizes reproducibility and technical rigor, ultimately facilitating more reliable AI-assisted development across the codebase.

## Architecture

The architecture is structured around modular pipelines that isolate data modeling, strategic decision-making, and execution. By decoupling the definition of documentation context from the generation logic, the package ensures a consistent, verifiable approach to code maintenance. This separation of concerns allows the system to independently evaluate code complexity, plan structured documentation updates, and execute changes.

Organizationally, the package is divided into task-specific modules, such as JSDoc updates and file summarization. Each module leverages internal components to manage its own lifecycle: context handlers define the necessary metadata and schemas, strategy resolvers determine the appropriate depth of analysis, and executors perform the final generation and integration tasks. These components collaborate through shared, schema-based models that represent source code structures, ensuring that AI-assisted outputs remain aligned with the existing codebase while maintaining auditability through bundled reasoning and safety assessments.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai-compiler
```

## Dependencies

This package requires a Node.js environment supporting ESM and is built upon Effect v4. TypeScript is recommended to fully leverage the library's type safety and schema definitions.

At runtime, the package depends on the Effect ecosystem for its core runtime and context management. It integrates seamlessly with internal infrastructure and AI modules, including `@gyomu/schema`, `@gyomu/infra`, and `@gyomu/ai`, which provide the necessary shared types, I/O handling, and LLM processing capabilities.

## Development

The architecture of this package is rooted in the principle of "Intentional Orchestration," which treats code intelligence as a structured, deterministic pipeline rather than an opaque, prompt-based process. By enforcing schema-based models for source code and documentation state, we eliminate ambiguity, ensuring that the AI operates within a rigorous, well-defined context. This structure is designed to decouple the high-level intent of a task—the "what" and "why"—from the low-level execution—the "how"—allowing us to maintain strict control over change management while abstracting the complexity of diverse AI model configurations.

Contributors should adhere to a philosophy of "Declarative Reproducibility," where every transformation is traceable, repeatable, and independently testable. The goal is to move away from erratic, monolithic interactions toward granular, strategy-driven workflows that prioritize safety and consistency. As a contributor, you are expected to maintain a clean separation between the logic of task planning and the mechanics of code mutation; prioritize the robustness of the schema over the sophistication of the prompt; and ensure that the system remains extensible enough to integrate new intelligence modules without compromising the integrity of the existing pipeline.

## Public API

- JSDoc Documentation Lifecycle - Comprehensive tools for analyzing code symbols, planning JSDoc updates, and managing the reconciliation of generated documentation with existing comments.
- Codebase Summarization - Hierarchical extraction of insights ranging from individual symbol summaries to file-level concepts and directory-wide architectural overviews.
- Pipeline Execution Framework - A robust orchestration layer that connects specific task inputs to AI model routes while handling complexity assessments and task configuration.
- Project Documentation Automation - Facilities for dynamically generating and updating project-level documentation, such as README sections, based on the current codebase state.

## License

MIT