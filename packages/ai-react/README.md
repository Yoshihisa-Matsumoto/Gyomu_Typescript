# Gyomu AI React

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust foundation for integrating AI-driven features into React applications within the Gyomu ecosystem. It acts as a bridge between standard user interfaces and the Gyomu communication protocol, ensuring a seamless connection for complex AI interactions.

By offering React-specific abstractions for session management, message transformation, and state handling, the package enables developers to incorporate AI capabilities with consistency and precision. It simplifies the implementation of sophisticated chat interfaces while providing standardized error management to maintain reliable application performance.

## Architecture

The architecture of `@gyomu/ai-react` is designed to bridge UI components with the Gyomu communication protocol. It functions as a stateful layer that abstracts complex chat interactions, ensuring that message transformations and status tracking remain consistent across the application. By centralizing the logic for lifecycle management and normalized error handling, the package decouples UI components from the underlying API complexities.

The package is organized to maintain strict behavioral contracts for its core operations. Internal logic is validated through a dedicated suite of integration and unit tests that ensure request creation, message mapping, and error parsing align with protocol requirements. This verification structure ensures that all data flowing between the user interface and the Gyomu backend maintains structural integrity and provides predictable results during network or API interactions.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai-react
```

## Dependencies

This package requires a modern ESM environment and is compatible with React 19 and Effect 4.x. It is built upon the Effect ecosystem, leveraging Effect Schema and Context for its core architecture.

Runtime functionality relies on `@gyomu/schema` for type definitions and `@gyomu/ui-core` for headless UI components. Additionally, the package integrates with `@ai-sdk/react` to handle AI-driven interactions and stream management within the React lifecycle.

## Development

The development philosophy of this package centers on the principle of "predictable abstraction," where complex AI-protocol orchestration is encapsulated within intuitive React Hooks. We believe that integrating AI into Gyomu-powered applications should not require developers to manage the intricacies of state synchronization or message normalization manually. By providing a declarative API that mirrors standard React patterns, we ensure that the underlying complexity of asynchronous streaming, session persistence, and error recovery remains decoupled from the UI implementation. This structure allows developers to focus on crafting high-quality user experiences while delegating the burden of robust communication protocols to our standardized infrastructure.

Contributors are expected to adhere to the principle of "composition over configuration," prioritizing modular hooks that can be easily composed to build sophisticated AI interfaces. Code quality must be defined by maintainability and type-safety; every transformation and state transition should be strictly typed to prevent runtime failures in mission-critical Gyomu workflows. We emphasize defensive programming in error handling—ensuring that every network interaction is resilient and that status tracking provides meaningful, actionable feedback. By keeping the core architecture lean and strictly focused on lifecycle management, we maintain a codebase that is both resilient to API evolution and accessible for future extensibility.

## Public API

- Chat Session Management - Provides React hooks to initiate, control, and observe chat sessions within UI components.
- Message Normalization - Utilities to transform and extract content from multi-part UI messages into consistent application-level formats.
- Resilient API Communication - Configurable fetch wrappers that automate error parsing and handle response exceptions for reliable backend interaction.
- Status Coordination - Standardizes raw backend status signals into a predictable state interface for UI rendering.

## License

MIT