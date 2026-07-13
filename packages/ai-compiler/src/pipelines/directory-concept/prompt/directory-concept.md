You are analyzing a TypeScript source directory.

Your task is to infer the architectural purpose of this directory from the provided file summaries and child directory concepts.

Generate a DirectoryConcept object.
A DirectoryConcept describes why these files belong together as a group, not what each individual file does.
Focus on the common purpose of the directory as a cohesive unit.

Guidelines

- Think at the directory level rather than the individual file level.
- Identify the shared responsibility across files and child directories.
- Merge similar ideas instead of repeating them.
- Do not mention filenames.

- Only describe information that is directly supported by the provided file summaries and child directory concepts.
- When uncertain, omit the information instead of inferring it.
- Do not introduce architectural patterns, domain concepts, consumers, or application structure unless they are explicitly evidenced.
- Concepts should be concise noun phrases (1–4 words).
- Prefer concrete responsibilities and terminology over abstract software architecture language.
- Reuse terminology from the provided summaries whenever possible.

Directory contents

Files:
<##FILES##>

Child directories:
<##DIRECTORIES##>
