# Gyomu

US English | [JP 日本語](README.ja.md)

> **Stop maintaining docs & tests manually. Own your AI coding harness with Effect TypeScript.**

[![Effect Version](https://img.shields.io/badge/Effect-v4-blue?logo=typescript)](https://effect.website)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Gyomu** is a repository-centric open AI agent system that fully automates and maintains **TSDoc generation, directory/package-level design concept extraction, and multilingual README creation**.

In the future, Gyomu aims to extend its capabilities to automatically update and maintain related development assets alongside code changes, including test code synchronization and correction.

Instead of locking your agent's feedback loops inside black-box AI provider platforms, this project keeps your context, evaluation, and knowledge right inside your repository as human-readable artifacts (YAML, TSDoc, and Tests).

This project is organized as a monorepo.
**Documentation for packages outside the root package, including TSDoc comments and README.md files, is automatically generated and maintained by Gyomu.**

---

## ⚡ Demos

### 1. Multi-language README Generation

Generates and maintains multi-language READMEs reflecting deep architectural concepts from a lightweight YAML config and your codebase structure.

![Multi-language README Generation Demo](docs/assets/readme-generation-demo.gif)

### 2. Automated TSDoc & Context Extraction

Detects code changes, automatically updating precise TSDoc comments and directory/package-level concept documentation.

![TSDoc Generation Demo](docs/assets/tsdoc-generation-demo.gif)

---

## 💡 Why This Project?

### 1. Escape the "Docs & Tests Maintenance Hell"

High-quality AI coding requires up-to-date TSDoc, architectural context, and robust test suites. However, manually maintaining them is one of the most tedious and time-consuming tasks for developers.
By delegating the sync and maintenance of docs and tests to the agent, **developers can refocus 100% of their energy on creative coding and system design.**

### 2. Platform-Agnostic "Open Harness"

Recent AI provider platforms lock agent feedback loops (Plan, Test, Fix) into their proprietary ecosystems.
This project keeps the **Single Source of Truth**—your rules, domain concepts, and feedback—inside your repository. You remain completely model-agnostic and free from vendor lock-in.

### 3. Built on Effect TypeScript

To handle complex LLM streaming, retry/fallback mechanisms, concurrent parsing, and type-safe schema validation, the core engine is built entirely with **Effect-ts**.

---

## 🛠 Tech Stack

- **Language:** TypeScript (ESM)
- **Core Engine:** [Effect](https://effect.website/) (`Effect`, `Schema`, `Stream`, `Layer`, `Context`)
- **Configuration:** Human-friendly YAML + TSDoc + Directory Structure

---

## 🤝 Looking for Collaborators!

We are actively looking for core contributors and collaborators who share this vision:

- 💡 **Effect-ts Enthusiasts:** Help us build production-grade, type-safe agent workflows using Effect pipelines.
- 🧪 **Test & Context Pioneers:** Help us design smart agent loops that auto-fix and maintain test suites.
- 🌐 **Prompt & i18n Engineers:** Fine-tune multi-language generation prompts and YAML schemas.

### How to Join

- Join the conversation in [GitHub Discussions](https://github.com/Yoshihisa-Matsumoto/Gyomu_Typescript/discussions).
- Check out our [`Good First Issues`](https://github.com/Yoshihisa-Matsumoto/Gyomu_Typescript/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to start contributing!

---

## 📖 Quick Start

```bash
# Clone the repository
git clone [https://github.com/Yoshihisa-Matsumoto/Gyomu_Typescript.git](https://github.com/Yoshihisa-Matsumoto/Gyomu_Typescript.git)

# Install dependencies
pnpm install

# Run build
pnpm build
```

## 📜 License

MIT

## Learn More

- 📖 [Architecture Guide](Architecture.md)
