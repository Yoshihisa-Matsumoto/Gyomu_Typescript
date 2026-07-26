# Gyomu Agent

US English | [JP 日本語](README.ja.md)

## Overview

This package serves as a primary orchestrator within the Gyomu ecosystem, providing a robust execution platform for intelligent agents. By integrating advanced AI models with project-specific code intelligence, it enables the creation and management of sophisticated development workflows.

The core mission is to facilitate declarative and extensible agent operations, supporting tasks such as deep code analysis, automated generation, and system updates. By leveraging specialized infrastructure for schema management and documentation, this framework empowers developers to build high-performance automation tools that streamline complex software engineering processes.

## Architecture

The @gyomu/agent package is structured as a central orchestrator that bridges high-level AI analysis with local TypeScript project operations. It manages the lifecycle and state of automated agents, implementing the decision-making logic required to translate analytical goals into concrete code-related tasks.

The architecture centers on a core execution layer supported by a robust verification infrastructure. Within the `src` directory, the package maintains specialized validation tools and testing logic that serve as a quality assurance layer. These components interact by subjecting analytical operations to rigorous verification, ensuring that the agents maintain stability and correctness when processing project inputs. By separating the agentic logic from the testing framework, the package ensures that its core analysis routines remain reliable throughout the automated execution process.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/agent
```

## Dependencies

This package requires a Node.js environment supporting ESM and is built specifically for Effect 4.x. It is designed to work seamlessly within modern TypeScript projects.

The library relies on `effect` as its primary runtime foundation, while leveraging `@gyomu/schema` for shared types and schemas. Additionally, it integrates with `@gyomu/infra` to handle core I/O and infrastructure operations. Ensure these base dependencies are installed in your project to utilize the package's full functionality.

## Development

The architecture of this package is built upon the principle of "Reflective Autonomy," where the agent acts not merely as a text generator, but as a state-aware participant in the software development lifecycle. By adopting a declarative approach to task definition, we decouple high-level intent from low-level execution, allowing developers to define *what* needs to be achieved in the codebase while delegating the *how* to modular, chainable execution strategies. This structure ensures that the system remains maintainable as project complexity scales, treating code analysis as a persistent, iterative loop rather than a series of disconnected prompts.

Contributors should prioritize "Composable Observability" and "Infrastructure-as-Code-Logic" when extending the platform. Every agentic action must be traceable, reproducible, and treat the local filesystem as a source of truth that the AI must respect and synchronize with. We advocate for a "Safety-First-by-Design" philosophy, where heuristic constraints and validation layers wrap all AI-generated operations. Our goal is to foster an ecosystem where granular capabilities—ranging from static analysis to complex refactoring—can be composed into sophisticated workflows without sacrificing the stability or integrity of the underlying TypeScript project.

## Public API

- Agent Orchestration - Provides the structural framework to define and execute autonomous agents capable of performing complex code analysis and transformation tasks.
- Code Intelligence Integration - Exposes capabilities for deep semantic analysis of TypeScript code by utilizing underlying structural and documentation models.
- Analytical Workflow Management - Coordinates multi-step processes involving schema validation, AI inference, and infrastructure interaction.

## License

MIT