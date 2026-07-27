# Gyomu UI

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a unified user interface for Gyomu by combining a shared design system, schema-driven forms, and specialized application components. Its primary mission is to foster an environment where developers can build interfaces that prioritize long-term maintainability, visual consistency, and accessibility. By serving as a comprehensive abstraction layer, the library separates UI implementation details from core application logic. This architectural approach enables the creation of reusable, highly extensible interfaces. It integrates low-level building blocks with declarative generation systems and dedicated Material UI adapters, ensuring a cohesive development experience across the entire ecosystem.

## Architecture

The architecture is organized into a modular hierarchy that separates foundational UI primitives, layout structures, and high-level declarative form systems. Core UI components provide atomic building blocks and composite elements, ensuring consistent interaction patterns and visual themes across the application. These components are consolidated via shared context and provider wrappers to maintain unified state management. The package utilizes an abstraction layer through adapter components, specifically for Material UI integration. These adapters encapsulate third-party dependencies, injecting project-specific styling, validation logic, and standardized property interfaces into base framework elements. At the top level, a declarative form system automates interface construction. By leveraging schema definitions, it orchestrates the rendering of dynamic fields using headless layout components, which define structural arrangements without imposing opinionated styles. This separation of concerns allows the form engine to manage complex layout logic and external submission control while remaining decoupled from specific visual implementations.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ui
```

## Dependencies

This package requires React 19 and is built upon Effect version 4.x. It is designed to work seamlessly within modern TypeScript environments that support these versions. At its core, the project leverages Effect for runtime and schema management, alongside `@gyomu/schema` for shared types. For the user interface, it integrates Material UI and shadcn/ui components to provide a consistent and responsive design system. Ensure your environment meets these version requirements before installation.

## Development

This package aims to standardize and streamline UI development in Gyomu, centered around a shared design system and component library. During development, prioritize reusability and composability of UI components, ensuring a decoupled design that does not depend on specific screen configurations. For form development, adopt a schema-driven approach; dynamically deriving the UI from data structures eliminates definition redundancy and ensures maintainability and type safety. To maintain the architecture, isolate UI framework-specific implementations into an adapter layer, clearly separating concerns between logic and visual representation. By decoupling layout structures from visual presentation, ensure the overall extensibility of the system. All components must prioritize accessibility and predictability, maintaining a consistent user interface through a shared Provider to manage application-wide UI states.

## Public API

- Design System Components - Provides a library of atomic and composite UI elements such as avatars, cards, buttons, and inputs.
- Declarative Form Automation - Enables automatic construction of forms from data schemas with built-in layout orchestration and submission handling.
- Material UI Integration - Offers standardized wrappers and layout adapters for Material UI, ensuring consistent styling and functional behavior.
- Headless Form Layouts - Delivers structural components for defining form and field layouts without imposing rigid visual styling.
- Global Interaction Management - Centralizes management of application-wide UI states such as tooltips and toast notifications.

## License

MIT