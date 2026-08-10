# Gyomu UI

## Repository Overview

The `@gyomu/ui` package functions as the core design system and component library for the Gyomu project. Its primary responsibility is to provide a standardized environment for building consistent, accessible, and maintainable user interfaces by integrating foundational UI building blocks, schema-driven form systems, and shared application components. By decoupling UI framework implementation details from application logic, the package ensures architectural separation and high reusability. It acts as the central interface for consolidating UI behavior and layouts, abstracting third-party library integrations to maintain visual and functional uniformity across the entire application ecosystem.

## Package Responsibilities

- Provide a unified library of reusable, atomic, and composite UI components.
- Define declarative interfaces for dynamic form generation based on schemas.
- Implement an abstraction layer to adapt third-party libraries to project-specific design standards.
- Maintain consistent layout patterns for forms and form-related fields.
- Centralize configuration for styling, typography, and utility-based interface interactions.

## Architecture

The architecture is organized into three primary layers: foundational UI components, specialized adapters, and automated feature logic.

*   **Foundation (`src/ui/components`)**: Provides atomic and complex UI building blocks. The `ui` directory offers reusable elements, while `layout/headless` provides structural containers for arranging these elements without enforcing visual styles.
*   **Adapter Layer (`src/ui/adapters/mui`)**: Acts as an abstraction layer for Material UI. The `fields` sub-directory standardizes form inputs by wrapping Material UI components with project-specific styling, configurations, and helper components like tooltips. This ensures consistent interaction patterns and visual feedback across the interface.
*   **Feature Logic (`src/features/form`)**: Orchestrates the automated form system. It uses schema definitions to dynamically render inputs by integrating the headless layout components with standardized field adapters. The `AutoForm` system manages internal state and provides external control handles to facilitate form submission and configuration. 

These layers interact by separating structural layout (headless), visual implementation (adapters), and business-level generation (features), allowing for flexible UI composition and centralized configuration.

## Design Principles

- Prioritize reusability and composability by maintaining a strict separation between layout structures and visual styling.
- Enforce a schema-driven approach for form generation to eliminate redundancy and ensure synchronization between data structures and UI representations.
- Abstract UI framework-specific logic into adapter layers to decouple core components and minimize the impact of future framework migrations.
- Uphold architectural integrity by strictly prohibiting business logic and direct backend API dependencies within UI components.
- Ensure consistent UI behavior and accessibility through centralized state management and adherence to a unified design system.

## Important Constraints

- Do not implement business logic within UI components.
- Do not depend on backend APIs directly.
- Do not depend on application-specific state management.
- Do not force a specific UI framework on consumers.
- Preserve the existing public export structure and API surface.
- Adhere to the adapter-based pattern when integrating third-party component libraries.
- Maintain the headless architecture for structural layout components to isolate styling from structure.
- Do not introduce side effects (I/O, network requests, database access) within components.
- Use the defined barrel file pattern for all module exports to ensure consistent consumption.
- Keep components atomic and composite-ready, favoring composition over monolithic designs.

## Editing Rules

- Use Effect Schema for all data structures that are persisted or exchanged with external entities.
- Design structured models instead of using free-form strings wherever possible.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Do not introduce circular dependencies between packages.
- Represent all side effects using Effect.
- Express errors through the Effect Error Channel instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before usage.
- Restrict dependencies on AI provider-specific APIs to the Infrastructure layer.
- Generate documentation from structured data such as Concepts.
- Avoid duplicating knowledge across different documents.
- Depend only on public APIs of other packages.
- Consolidate reusable logic into existing shared packages to avoid duplicate implementations.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and independent of external services.
- Maintain human-managed knowledge and code-derived knowledge as independent data sources.
- Generate documentation via Document models rather than constructing raw Markdown strings.

## Navigation

This document provides a high-level overview of the package Concept, responsibilities, and design decisions. For more detailed information, refer to the following documents:

- **Architecture Documentation**
  Describes the internal architecture, major components, dependencies, and design decisions of this package.
- **API Reference**
  Describes public APIs, exported modules, and usage patterns.

- **Technical Documentation**
  Describes technical details, configuration, dependencies, and implementation-specific information.

- **Development Guide**
  Describes development workflows, coding conventions, testing strategies, and contribution guidelines.

- **Project Knowledge**
  Contains additional knowledge maintained by developers, including constraints, rationale, terminology, and operational guidelines.


When modifying this package, review the relevant documentation before making changes to preserve the intended responsibilities and architectural boundaries.