# Gyomu AI React

US English | [JP 日本語](README.ja.md)

## Overview

This package provides a robust foundation for integrating AI capabilities into React applications within the Gyomu ecosystem. It serves as a bridge between the AI SDK and project-specific transport protocols, ensuring a standardized approach to front-end integration. By delivering essential functionality through specialized React Hooks, the package streamlines chat session management, message transformation, and state handling. This architecture simplifies the development process by providing consistent mechanisms for error management and data flow, allowing developers to implement AI-driven features reliably and maintainably across their interfaces.

## Architecture

The architecture of `@gyomu/ai-react` is organized as a modular bridge that connects the AI SDK to Gyomu-specific transport protocols. The package is structured to decouple session lifecycle management from underlying data transformation, ensuring that React components remain agnostic of complex communication schemas. Responsibilities are divided into discrete functional layers: hooks manage the chat session state and synchronization, while transformation utilities normalize message formats and extract content from multi-part objects. A dedicated error-handling layer standardizes network and service exceptions, ensuring consistent status reporting throughout the application. Internal integrity is maintained through a robust testing infrastructure within the `src` directory. These tests serve as a verification layer that validates the library’s behavioral contracts, ensuring that fetch creation, message mapping, and error parsing logic remain consistent as the package evolves.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/ai-react
```

## Dependencies

This package requires an ESM-based environment with Node.js, React 19, and Effect 4.x as its core foundation. It is built to leverage TypeScript for robust type safety across all integrated modules. Runtime functionality relies on Effect for system architecture, while `@gyomu/schema` and `@gyomu/ui-core` provide essential data structures and headless UI components. Additionally, `@ai-sdk/react` is integrated to handle specific Vercel-related patterns and error management within your application.

## Development

This package serves as the AI UI foundation for the Gyomu project, aiming to bridge React applications with the Gyomu communication protocol to enable consistent AI feature integration. Development must strictly adhere to an API design centered on React Hooks, maintaining a clear separation between the UI layer and the internal Gyomu protocol. Contributors are required to design UI components to be independent of specific Provider implementations and exclude dependencies on frameworks other than React, ensuring the library remains independent and maintainable. The core architecture emphasizes the standardization of data flow through a layer that handles message format conversion. Chat session lifecycle management and state transitions must follow a consistent state model to maintain predictability, with standardized mechanisms applied for complex data extraction and error handling. The system ensures overall stability by adhering to a standardized error reporting scheme for both network and application-level exceptions. Future development should continue to prioritize the abstraction of the UI layer and the robust separation of internal protocols based on these principles.

## Public API

- Chat Session Management - Provides React hooks to initiate, control, and observe the state of a Gyomu-powered chat session.
- Message Transformation - Standardizes message formats by mapping AI SDK primitives to application-specific schema requirements.
- Transport Error Handling - Standardizes the parsing and reporting of network and service errors to ensure a consistent user experience during API failures.
- Message Content Utilities - Offers helper functions to extract readable content from complex, multi-part chat message structures.

## License

MIT