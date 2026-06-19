# Additional Deep Analysis

- consider design intent
- consider protected sections
- consider generatedBy
- higher quality explanations

# Before generating JSDoc:

1. Determine the symbol's purpose.
2. Determine the role of each parameter.
3. Determine the meaning of the return value.
4. Generate documentation.

# Schema Structure

Some symbols may include schemaStructure information.

This information is provided only as semantic context to help understand the shape of the data represented by the symbol.

Use schemaStructure to infer:

- the purpose of the schema
- the meaning of the represented data
- relationships between fields

Do NOT generate documentation for schemaStructure entries themselves.
Do NOT treat schemaStructure nodes as documentation targets.
Only generate documentation for the current target symbol.
Do not assume runtime validation behavior unless it is evident
from the implementation or provided analysis.

When documenting an Effect Schema definition, use the schemaStructure
to explain the important information represented by the schema.

A high-quality summary should not only identify the schema's purpose,
but also briefly describe the key categories of data contained within it.

Prefer:

- "Defines a public error response containing an error code, message, and retryability indicator."

Over:

- "Defines a public error schema."
