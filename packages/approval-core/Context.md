# Gyomu Approval Core

## Repository Overview

The `@gyomu/approval-core` package provides the domain foundation for approval workflows in the Gyomu project. It defines the standardized domain models, service definitions, and interfaces necessary for managing approval requests, policy evaluation, and lifecycle transitions. This package centralizes the logic for tracking and auditing both manual and automated interventions. By decoupling business logic from persistence layers, it establishes a unified contract that ensures consistency in request management and historical logging throughout the system. This architecture supports the implementation of extensible approval processes that meet various operational requirements.

## Package Responsibilities

- Define the domain models for approval requests, decisions, and lifecycle states.
- Specify the command interfaces for initiating, approving, and rejecting requests.
- Establish architectural ports to decouple approval logic from infrastructure implementations.
- Provide service abstractions for auditing and retrieving historical approval records.
- Ensure consistent identity and context tracking across approval interactions.

## Architecture

The architecture is organized into functional layers that separate core domain logic, input contracts, system abstractions, and data retrieval services:

*   **`src/model`**: Defines the foundational domain entities, including `ApprovalRequest`, `ApprovalChallenge`, `ApprovalDecision`, `ApprovalStatus`, and `ApprovalRecord`. This layer maintains the state and structural integrity of the workflow.
*   **`src/command`**: Contains the input schemas for lifecycle operations, enforcing consistent contracts for actions such as approvals and rejections.
*   **`src/ports`**: Serves as the abstraction layer, defining interfaces for request submission and state management to decouple business logic from external implementation details.
*   **`src/services`**: Provides the interface for querying and managing historical approval data for users and tools.

The root `src` directory acts as the central entry point, aggregating these components to provide a unified API surface. The architecture ensures that domain models defined in `src/model` are utilized across service operations and port implementations, while `src/command` provides the necessary interface for state transitions.

## Design Principles

- Prioritize domain-centric modeling to ensure the approval framework remains independent, reusable across various systems, and shielded from infrastructure-specific implementation details.
- Enforce strict lifecycle state transitions through type-safe command structures to prevent invalid state changes and ensure domain integrity.
- Maintain clear separation between policy-driven evaluations and human-driven actions, allowing both to be unified under a consistent domain model.
- Preserve immutability of audit trails to guarantee absolute traceability and prevent the loss of historical state change information.
- Restrict package scope by excluding concrete infrastructure, persistence, UI, or notification logic, ensuring the package remains a pure architectural foundation for external implementations.

## Important Constraints

- Do not implement persistence logic.
- Do not implement notification or workflow execution side effects.
- Do not implement UI or API-specific logic.
- Do not depend on infrastructure layer implementations.
- Do not include concrete implementations of approval policies.
- Do not introduce dependencies outside of `@gyomu/schema` and `effect`.
- Preserve the existing public export structure and the 15 exported symbols.
- Maintain strict separation between commands, models, policies, ports, and services.
- Define domain data structures exclusively within `src/model`.
- Define system interaction contracts exclusively as ports within `src/ports`.

## Editing Rules

- Use Effect Schema to define all data structures intended for persistence or external communication.
- Design structured models instead of relying on free-form strings whenever possible.
- Keep analysis, concept generation, document generation, and rendering processes decoupled.
- Avoid introducing circular dependencies between packages.
- Represent effectful operations using Effect.
- Use the Error Channel in Effect to handle errors instead of throwing exceptions.
- Validate all AI-generated data with Effect Schema before usage.
- Depend only on AI provider-specific APIs within the Infrastructure layer.
- Generate documentation from structured data like Concepts to maintain consistency.
- Avoid duplicating knowledge across multiple documents.
- Depend only on public APIs of other packages.
- Consolidate shared logic into existing common packages to prevent redundant implementation.
- Update or add tests whenever observable behavior changes.
- Ensure tests are deterministic and independent of external services.
- Maintain human-managed knowledge and code-derived knowledge as independent data sources.
- Generate Markdown documentation via Document models rather than assembling strings directly.

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