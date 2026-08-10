# Gyomu Approval Core

US English | [JP 日本語](README.ja.md)

## Overview

This package provides the foundational domain models, interfaces, and service definitions required to manage complex approval workflows within the Gyomu project. It establishes a standardized contract for tracking, evaluating, and auditing requests, effectively bridging the gap between manual human interventions and automated system processes.

By decoupling business logic from persistence, the framework ensures a robust, extensible foundation for lifecycle management. This approach enables organizations to maintain consistent governance across diverse operational requirements while ensuring full transparency through integrated historical auditing.

## Architecture

The package uses a modular architecture that separates domain logic, interaction contracts, and data management. At its core, domain models define the structural foundations of approval requests, lifecycle states, and decision outcomes, ensuring a consistent representation of the workflow. Command schemas standardize user and system inputs, enforcing contract consistency for lifecycle transitions such as approvals and rejections. These commands interact with system ports, which act as an abstraction layer to decouple business logic from underlying infrastructure, enabling flexible request submission and state persistence. Finally, the architecture includes dedicated service abstractions for managing historical records. These components allow for the retrieval of audit logs associated with specific users and tools. The entire system is unified through a central entry point that exposes these models, commands, and services, providing a cohesive API for integrating and managing approval workflows.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/approval-core
```

## Dependencies

This package requires a Node.js environment that supports ESM and is built specifically for Effect 4.x. It relies on the Effect ecosystem—including its runtime, schema, and context management—as its primary foundation. Furthermore, it integrates with `@gyomu/schema` to manage shared types and data definitions throughout the application.

## Development

This package provides a domain foundation for approval workflows in the Gyomu project, aiming to integrate both human and automated approvals. The core design focuses on positioning approval requests, policy evaluation, lifecycles, and audit trails as central domain models, fully decoupled from the infrastructure layer. Contributors must maintain a loosely coupled and highly extensible domain design by defining services solely through interfaces and eliminating dependencies on specific technology stacks or infrastructure implementations. To ensure the integrity of the approval process, lifecycle state transitions must be strictly defined, and the system must be designed to prevent unauthorized operations. Approval results should be clearly separated into policy evaluations and user actions, and all operations on these must be performed through type-safe commands. Furthermore, audit trails must be maintained as immutable records, ensuring consistent identity and context tracking to pursue a highly reliable domain model that preserves the integrity of all change history.

## Public API

- Approval Lifecycle Management - Models and tracks the end-to-end status of approval requests from initiation through to final resolution.
- Decision Evaluation Framework - Defines structured outcomes for approval policy checks, including requirements for further authorization or denial.
- Interaction Ports - Provides standardized interface contracts for request submission and state persistence, enabling integration with various backends.
- Auditing and History - Enables retrieval and management of historical events and approval records associated with users and tools.
- Command Input Schemas - Standardizes the parameter structures required for consistent user and system interactions with approval workflows.

## License

MIT