# Gyomu AI React

## Repository Overview

The `@gyomu/ai-react` package serves as the dedicated AI UI foundation for the Gyomu project, facilitating the integration of AI functionality into React applications. It acts as an abstraction layer between the AI SDK and Gyomu-specific transport protocols. The package is responsible for managing chat sessions, message transformations, application state, and error handling. By exposing these functions through React hooks, it provides a standardized mechanism for incorporating Gyomu's AI features into front-end components, ensuring consistent communication and interaction patterns across the application.

## Package Responsibilities

- Bridge the AI SDK chat interfaces with Gyomu communication protocols.
- Manage the lifecycle and state of active chat sessions within React components.
- Normalize disparate message formats between AI models and internal Gyomu structures.
- Implement standardized error handling and status reporting for network and application-level exceptions.
- Provide robust data extraction utilities for parsing complex UI message objects.

## Architecture

The package architecture is organized around the `src` directory, which functions as the central verification layer for the library. This area acts as the primary test suite, ensuring the integrity of the core logic through automated unit and integration testing.

The directory is structured to enforce specific behavioral contracts across three key architectural domains:
*   **Fetch Creation:** Validates the underlying logic responsible for request generation.
*   **Message Transformations:** Ensures the correctness of data mapping and structural output.
*   **Error Parsing:** Verifies that public-facing error states are correctly identified and processed.

The `src` components maintain a dependency on the library’s internal logic, executing test suites against these modules to confirm that inputs are mapped to expected outputs and that internal processes adhere to defined functional specifications.

## Design Principles

- Decouple the UI layer from internal protocols by utilizing a dedicated transformation layer for all message conversions, ensuring UI components remain agnostic of infrastructure details.
- Enforce React integration strictly through a Hooks-based API to simplify state management while prohibiting the exposure of provider-specific implementations to the UI components.
- Maintain predictable and consistent state transitions for chat operations to ensure a reliable user experience across the application.
- Mandate the use of shared utility layers for network communication and error handling to guarantee architectural uniformity and prevent leaking infrastructure logic into the UI.
- Restrict dependencies strictly to the React ecosystem, ensuring no reliance on external UI frameworks or direct manipulation of underlying AI models and providers.

## Important Constraints

- Do not interact directly with AI models or Providers.
- Do not implement business logic.
- Do not depend on UI libraries other than React.
- Do not transform message formats directly within UI components.
- Perform all API communications exclusively through the provided common utilities.
- Preserve the existing public export structure (10 total symbols).
- Do not introduce dependencies outside of the defined runtime dependencies (`@ai-sdk/react`, `@gyomu/schema`, `@gyomu/ui-core`, `ai`, `effect`, `react`).
- Maintain the standardized error handling and status reporting protocols for all network and application-level exceptions.
- Ensure all message mapping transformations adhere to the established behavioral contracts validated by the test suite.

## Editing Rules

- Use Effect Schema for all persisted or externally exchanged data.
- Design structured models rather than using free-form strings.
- Decouple analysis, concept generation, document generation, and rendering processes.
- Prevent circular dependencies between packages.
- Represent all side effects using Effect.
- Express errors through the Effect Error Channel instead of throwing exceptions.
- Validate AI-generated data with Effect Schema before use.
- Restrict dependencies on AI provider-specific APIs to the Infrastructure layer.
- Generate documentation from structured data such as concepts.
- Avoid duplicating knowledge across different documentation files.
- Depend only on public APIs of other packages.
- Consolidate reusable logic into existing shared packages to avoid implementation duplication.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and independent of external services.
- Maintain human-managed knowledge and code-derived knowledge as independent information sources.
- Generate documentation using Document models instead of assembling Markdown strings directly.

## Navigation

This document provides a high-level overview of the package concept, responsibilities, and design decisions. For more detailed information, refer to the following documents:

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