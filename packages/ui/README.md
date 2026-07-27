# Gyomu UI

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a unified user interface for Gyomu by combining a shared design system, schema-driven forms, and specialized application components. Its mission is to establish a development environment that ensures consistent, accessible, and maintainable interfaces across the entire ecosystem.

By serving as both a comprehensive component library and an abstraction layer, the package effectively decouples UI implementation details from core application logic. This architecture fosters the creation of highly reusable and extensible interface elements, facilitating a streamlined approach to building scalable applications while maintaining rigorous design standards and high-quality integration with Material UI.

## Architecture

The architecture of `@gyomu/ui` is organized into a modular structure that separates atomic UI building blocks from high-level form orchestration and third-party framework integration. Foundational interface elements and headless layout components provide a consistent structural base, while shared provider contexts manage interaction patterns and global state across the library.

The system utilizes an abstraction layer to encapsulate Material UI dependencies, ensuring consistent styling and specialized behavior for form inputs. This adapter layer standardizes field interfaces and injects project-specific configurations, such as validation strategies and layout defaults, into base framework components.

Finally, a declarative form generation system automates interface construction by consuming data schemas. This component manages dynamic field rendering and provides external handles for submission control. By coordinating schema-driven orchestration with the underlying UI adapters and layout primitives, the package ensures that form generation remains decoupled from specific visual implementations while maintaining uniform interaction patterns across the application.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ui
```

## Dependencies

This package requires an ESM environment and is compatible with React 19 and Effect 4.x. It is built upon the Effect ecosystem for runtime logic and schema management, leveraging `@gyomu/schema` for shared type definitions.

The UI layer relies on Material UI and shadcn/ui components to provide a consistent design system. Please ensure your project is configured to support these dependencies before installation.

## Development

This package aims to maximize maintainability, consistency, and accessibility as a unified user interface foundation for Gyomu. By centering on a design system and common components, it separates UI framework implementation details into an adapter layer, enabling a reusable and highly extensible UI library independent of specific libraries. This clearly decouples application logic from UI representation, maintaining an architecture that can flexibly adapt to future framework updates and specification changes.

During development, eliminate duplication of UI descriptions in form and layout definitions by strictly following a schema-driven approach. All components must be designed as composable units and implemented with a focus on type safety and predictability. Additionally, it is mandatory to utilize shared Providers for state management and comply with accessibility standards. Maintain a design that separates layout structure from visual representation to ensure a consistent user experience throughout the entire application.

## Public API

- Design System Components - Provides a library of atomic and composite UI elements such as avatars, cards, buttons, and inputs.
- Declarative Form Automation - Enables automatic construction of forms from data schemas with built-in layout orchestration and submission handling.
- Material UI Integration - Offers standardized wrappers and layout adapters for Material UI, ensuring consistent styling and functional behavior.
- Headless Form Layouts - Delivers structural components for defining form and field layouts without imposing rigid visual styling.
- Global Interaction Management - Centralizes management of application-wide UI states such as tooltips and toast notifications.

## License

MIT