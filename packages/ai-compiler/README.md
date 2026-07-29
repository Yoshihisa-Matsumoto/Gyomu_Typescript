# Gyomu AI Compiler

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as the AI code intelligence foundation for the Gyomu project. It provides a structured framework for automating complex tasks such as source code analysis, documentation generation, and code summarization. By formalizing these processes into declarative pipelines, the system ensures that AI-driven development remains consistent, reproducible, and highly maintainable.

The platform utilizes defined schemas and execution pipelines to transform source code metadata into actionable insights, including project-level summaries and documentation plans. By standardizing input contexts and output configurations, it enables deterministic and auditable transformations for TypeScript codebases. This approach streamlines AI-assisted workflows while maintaining high standards for technical accuracy and project governance.

## Architecture

The architecture is organized around specialized pipelines that automate code analysis and documentation. These pipelines are functionally divided into layers responsible for data context, schema definition, and execution logic. By decoupling the representation of source code metadata from the operational logic, the package ensures that documentation tasks, such as JSDoc updates or file summarization, remain deterministic and auditable.

The context layer standardizes how source code symbols and file-level concepts are represented, providing a uniform foundation for downstream analysis. The schema layer defines the structure of transformation plans, encapsulating not only the intended changes—such as additions or deletions—but also the reasoning and safety assessments required for auditability. Finally, the execution and mode layers govern the pipeline flow, using complexity strategies to resolve the appropriate update modes and orchestrating the actual application of transformations. This modular approach allows the package to maintain consistent documentation standards across TypeScript projects through structured, data-driven collaboration between components.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai-compiler
```

## Dependencies

This package requires a Node.js environment supporting ESM and is built upon Effect v4. It utilizes TypeScript to ensure type safety across all integrated modules.

The project relies on the core Effect ecosystem for runtime and schema management. Additionally, it integrates with `@gyomu/schema`, `@gyomu/infra`, and `@gyomu/ai` to provide unified data structures, infrastructure utilities, and LLM processing capabilities, respectively. Ensure these dependencies are correctly configured within your workspace before implementation.

## Development

This package serves as the core AI code intelligence engine for the Gyomu project, designed to facilitate consistent, reproducible, and maintainable AI-assisted development. To achieve this, the architecture enforces a strict decoupling of concerns: every AI task is structured as an independent Pipeline where inputs and outputs are governed by standardized Schemas. By treating these schemas as formal contracts, we ensure type safety across all automated operations, allowing contributors to build modular components that can be reliably integrated into broader maintenance workflows without risking system instability.

The evolution of this codebase relies on a rigorous separation between Analysis and Plan phases, ensuring that AI-generated insights remain distinct from proposed code modifications. All transformations must be validated through a Plan before execution, providing a deterministic mechanism for auditability and safety. Contributors are expected to route all AI tasks through defined Routes, which maintain a clear boundary between model configurations and specific processing logic. By ensuring that complexity and update modes are handled via these structured pipelines, the architecture remains adaptable to varying code scales while preserving the integrity and traceability of every automated change.

## Public API

- JSDoc Automation - Orchestrates the analysis and automated updating of JSDoc comments based on symbol complexity and structural metadata.
- Codebase Summarization - Generates concise conceptual summaries for files, directories, and entire packages to improve developer navigation and documentation.
- Pipeline Orchestration - Provides a consistent execution framework for running various AI-driven code analysis tasks with configurable context and strategies.
- Content Translation - Exposes infrastructure for translating technical documentation and summaries using configured AI model routes.
- Readme Generation - Supports the programmatic construction of documentation sections within README files using structured AI-driven templates.

## License

MIT