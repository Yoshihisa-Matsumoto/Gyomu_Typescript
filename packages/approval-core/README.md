# Gyomu Approval Core

US English | [JP 日本語](README.ja.md)

## Overview

This package provides the foundational domain models, interfaces, and service definitions required to manage complex approval workflows within the Gyomu ecosystem. It establishes a standardized architecture designed to support both manual and automated interventions with high extensibility.

By offering a unified approach to request lifecycles, policy-based decision-making, and immutable audit history, the framework ensures consistent governance across organizational processes. It serves as a robust domain infrastructure that facilitates the reliable execution and tracking of approval requirements in diverse operational environments.

## Architecture

The package employs a modular architecture centered on domain-driven design to manage approval workflows. At its core, the system separates concerns into distinct layers: domain models define the structural data for requests and their lifecycle states, while command schemas standardize input for state transitions. This clear separation ensures that business logic remains decoupled from specific user or system interactions.

System connectivity is managed through a ports-based abstraction layer, which establishes contracts for request initiation and state persistence. This design allows the core logic to operate independently of external storage or execution environments. Complementing this, a service layer provides unified access to historical data, enabling consistent auditing and retrieval of records across both users and tools. By aggregating these components through a centralized entry point, the architecture provides a robust, type-safe API for integrating complex approval workflows while maintaining strict data integrity and traceability throughout the entire request lifecycle.

## Installation

Install using pnpm.

```bash
pnpm add @gyomu/approval-core
```

## Dependencies

This package requires a Node.js environment supporting ESM and is designed for compatibility with Effect 4.x. It leverages the Effect ecosystem as its primary foundation.

Functionality is built upon the Effect runtime, Schema, and Context modules. Additionally, this package utilizes `@gyomu/schema` for shared types and schema definitions. Ensure your project is configured for ESM compatibility before integrating this library.

## Development

This package is built on the philosophy of **"Policy-as-Code Independence,"** treating approval workflows as a decoupled infrastructure service rather than a byproduct of specific business features. By abstracting the request lifecycle into a standardized domain model, we ensure that the system remains agnostic to whether an approval is triggered by a human stakeholder or an automated system. This architectural separation prevents domain leakage, allowing the underlying approval engine to remain modular and composable, which is essential for scaling across the diverse requirements of the Gyomu project.

Contributors should adhere to the principle of **"Strict Immutability and Traceability,"** treating every state transition—from initiation to final resolution—as an auditable event. Data integrity is prioritized through strongly typed state machines and standardized input schemas, ensuring that no request can reach an ambiguous state. Furthermore, we embrace a **"Contract-First" approach**; all interfaces must favor extensibility over immediate convenience. Developers are expected to prioritize long-term interoperability, ensuring that as new organizational policies emerge, they can be plugged into the evaluation engine without requiring structural changes to the core domain services.

## Public API

- Approval Workflow Modeling - Defines the core lifecycle, statuses, and challenge structures necessary to represent complex approval requests within the system.
- Policy Evaluation Results - Standardizes the outcome of approval policy checks, allowing for clear distinction between approved, denied, or pending decisions.
- Lifecycle Management Ports - Provides abstract interfaces for submitting new requests and managing their state, enabling decoupling from infrastructure implementations.
- Audit and History Tracking - Enables retrieval of historical approval events, facilitating auditability and data analysis for users and integrated tools.

## License

MIT