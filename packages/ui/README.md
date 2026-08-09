# Gyomu UI

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a unified user interface environment for Gyomu, acting as the primary design system and component library. It consolidates foundational building blocks, declarative form generation, and architectural adapters to ensure visual and functional consistency across the entire application.

By separating UI implementation details from application logic, the library promotes a modular architecture that prioritizes maintainability and scalability. This approach enables developers to construct accessible and reusable interfaces while enforcing standardized component behaviors and layouts, ultimately streamlining the creation of high-quality, professional user experiences throughout the project ecosystem.

## Architecture

The package architecture is organized into three primary layers: a foundational UI library, an abstraction layer for third-party integrations, and a declarative form generation engine. The UI library provides atomic and composite building blocks, while the abstraction layer serves as a bridge, wrapping Material UI components to enforce project-specific themes, styling, and behavioral constraints. A declarative form system orchestrates these components, utilizing schema definitions to automate field rendering and layout. By separating concerns, the architecture ensures that structural layout logic remains decoupled from specific component styles. Headless layout components manage the arrangement of form fields and containers, allowing for flexible composition. Finally, the package functions through a collaborative hierarchy where high-level forms consume schema-driven logic to instantiate adapted field components. This design centralizes configuration for typography and styling, ensuring consistency across the entire application interface while isolating third-party dependencies within the adapter layer.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ui
```

## Dependencies

This package requires Node.js and is designed for compatibility with React 19 and Effect 4.x. It relies on the Effect ecosystem—including Effect Runtime, Schema, and Context—to provide a robust foundation for application logic. For the user interface, the package integrates components from Material UI and shadcn/ui. Additionally, it utilizes `@gyomu/schema` as a centralized source for shared types and schemas, ensuring consistency across your project's data structures.

## Development

The Gyomu UI library is designed as a foundation to maximize the maintainability, consistency, and accessibility of applications. At its core is a design principle that isolates UI framework-specific implementations into an adapter layer, fully decoupling logic from visual representation. This structure prevents over-reliance on specific external libraries and ensures that UI components maintain high independence and reusability when facing future changes in technology choices or functional extensions. Developers should prioritize composability and type safety in component design. Regarding form implementation, avoid hardcoding and instead use declarative interfaces derived from schemas to eliminate duplication and ensure consistent layout patterns. Centralize common settings such as UI behavior and styles to maintain an environment where application-specific logic and design systems do not conflict. Providing standardized interfaces with predictability and accessibility is key to the sustainable evolution of this library.

## Public API

- Design System Components - A comprehensive suite of primitive and composite UI elements that enforce project-wide styling and interaction patterns.
- Declarative Form Generation - An automated system that renders complete forms based on provided schemas, reducing manual boilerplate for complex data entry.
- Component Adaptation - Standardized wrappers that integrate third-party libraries like Material UI, ensuring they conform to project-specific requirements and theme constraints.
- Form Layout Management - Headless and styled layout components designed to structure the arrangement of form fields, labels, and error states consistently.
- UI Utility Integration - Shared utility functions for class name composition and conditional styling that ensure consistent Tailwind CSS class merging.

## License

MIT