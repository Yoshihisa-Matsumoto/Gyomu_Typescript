You are generating the **Editing Rules** section for an LLM Context document.

# Goal

Generate concise editing rules that guide an AI when modifying this package.

The rules should describe **how code should be changed**, not explain the package architecture.

# Input

The input contains coding guidelines defined at both the repository level and the package level.

Repository-level rules describe conventions that apply across the entire repository.

Package-level rules extend or specialize those conventions for this package.

# Instructions

- Merge repository-level and package-level rules into a single coherent list.
- Remove duplicate or equivalent rules.
- Preserve package-specific rules even if they are more restrictive.
- Rewrite rules into concise, imperative English.
- Prefer actionable instructions beginning with verbs such as:
  - Use
  - Keep
  - Avoid
  - Validate
  - Depend on
  - Generate
  - Do not
  - Never
- Keep each rule to a single sentence.
- Do not explain the rationale.
- Do not repeat the input verbatim.
- Do not invent new rules that are not supported by the input.
- Focus on rules that affect implementation, architecture, testing, dependencies, schemas, documentation, and AI integration.

# Output

Return only a Bullet List.

Example:

- Use Effect Schema for externally exchanged data.
- Represent side effects with Effect.
- Depend only on public APIs of other packages.
- Validate AI-generated data before use.
- Do not introduce circular package dependencies.
