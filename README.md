# Gyomu - Enterprise TypeScript Utility Library

## Overview

**Gyomu** is a comprehensive TypeScript utility library designed to accelerate enterprise application development. It provides encryption, file operations, database access, date manipulation, and web component functionality, significantly reducing development time and improving troubleshooting efficiency.

## Key Features

- **Error Handling & Logging** - Customizable error hierarchy and logging capabilities
- **Parameter Management** - Flexible parameter management with database integration
- **Task Management** - Asynchronous task execution and state management
- **Milestone Management** - Project progress tracking functionality
- **Encryption & Security** - AES-GCM and RSA encryption with best practices
- **File Operations** - Comprehensive file manipulation and archiving
- **Web Components** - Type-safe DOM manipulation and page parsing
- **Additional Utilities** - Date processing, number operations, base64 encoding, and more

## Installation

```bash
npm install gyomu
# or
pnpm install gyomu
```

## Quick Start

### Basic Usage Example

```typescript
import { aesEncrypt, aesDecrypt } from 'gyomu';

// Encrypt data
const plainText = 'sensitive data';
const key = 'my-secret-key';
const encrypted = aesEncrypt(plainText, key);

// Decrypt data
const decrypted = aesDecrypt(encrypted, key);
console.log(decrypted); // 'sensitive data'
```

### Error Handling

```typescript
import { ResultAsync, DBError, genericDBFunction } from 'gyomu';
import { prisma } from './dbsingleton';

// Type-safe error handling using ResultAsync
function getUser(userId: string): ResultAsync<User, DBError> {
  return genericDBFunction<User>(
    'fetch user',
    async () => prisma.users.findUnique({ where: { id: userId } }),
    [],
  );
}

// Calling code
getUser('123')
  .andThen((user) => processUser(user))
  .mapErr((error) => console.error(error.message))
  .match(
    (success) => console.log('Done'),
    (failure) => console.error(failure),
  );
```

### File Operations

```typescript
import { FileInfo, FileOperation } from 'gyomu';

// Get file information
const fileInfo = new FileInfo('./path/to/file.txt');
console.log(fileInfo.size); // File size
console.log(fileInfo.updateTime); // Update date

// Search for files
const files = FileOperation.search(
  './src',
  [new FileFilterInfo(FilterType.FileName, FileCompareType.Contains, '.ts')],
  true, // Recursive search
);
```

### Web DOM Operations

```typescript
import { Page, Table } from 'gyomu/web';
import axios from 'axios';

// Load and parse page
const response = await axios.get('https://example.com');
const page = new Page({ kind: 'response', response });

// Search elements by XPath
const tables = page.searchByXPath('//table[@class="data"]');

// Search elements by class name
const elements = page.getElementsByClassName<HTMLTableElement>('results');
```

## Architecture

Gyomu is designed with the following layered structure:

1. **Encryption Layer** (`encryption.ts`)
   - AES-GCM symmetric encryption with authenticated encryption
   - RSA asymmetric encryption and decryption
   - Support for multiple encryption methods
   - File-based encryption operations

2. **Data Access Layer** (`dbutil.ts`, `parameter.ts`)
   - Prisma client integration with type-safe wrappers
   - Automatic error mapping to domain-specific error types
   - Built-in retry logic for transient failures
   - ResultAsync-based return values for functional error handling

3. **Domain Models** (`fileModel.ts`, `user.ts`)
   - Strongly-typed entities with immutable properties
   - Clear separation of concerns
   - Support for polymorphic implementations

4. **Utility Layer** (`base64.ts`, `dateOperation.ts`, `numberOperation.ts`)
   - Pure functions with no side effects
   - Consistent naming and API design
   - Focused, single-responsibility modules

5. **Configuration Layer** (`configurator.ts`)
   - System configuration abstraction
   - Environment-based initialization
   - Dependency injection support

6. **Presentation Layer** (`web/*.ts`)
   - Type-safe DOM operations with TypeScript generics
   - Custom web components and element wrappers
   - HTML page parsing and XPath evaluation

For detailed information, see [exemplars.md](exemplars.md#architecture-observations).

## Coding Standards

This project adheres to strict coding conventions documented in detail in [exemplars.md](exemplars.md):

### Error Handling

- Always use custom error types from [src/errors.ts](src/errors.ts)
- Type-safe error handling with `ResultAsync<T, E>` instead of try/catch
- Preserve error context with inner error chaining
- Map domain-specific errors appropriately

For details: [exemplars.md - Error Handling & Custom Errors](exemplars.md#error-handling--custom-errors)

### Type Safety

- Avoid `any` type; use `unknown` with type guards
- Manage state with discriminated unions
- Create type-safe enums with `as const` for single source of truth
- Leverage generic type constraints for compile-time verification
- Use readonly properties to enforce immutability

For details: [exemplars.md - Type Safety](exemplars.md#2-type-safety)

### Security

- Follow encryption best practices in [src/encryption.ts](src/encryption.ts)
- Use authenticated encryption (AES-GCM) over unauthenticated modes
- Validate all input before cryptographic operations
- Load secrets from environment variables, never hardcode
- Preserve error context while avoiding information disclosure

For details: [exemplars.md - Security](exemplars.md#3-security)

### Testing

- Write comprehensive tests covering positive, negative, and integration cases
- Use reusable utilities in [src/**tests**/baseClass.ts](src/__tests__/baseClass.ts)
- Employ descriptive test names indicating tested behavior
- Test error conditions with `.toThrow()` assertions
- Validate cross-system compatibility (e.g., encryption with other languages)

For details: [exemplars.md - Testing Patterns](exemplars.md#testing-patterns)

## Configuration and Setup

### Environment Variables

```bash
# .env
GYOMU_COMMON_MODE=Production
DATABASE_URL=postgresql://user:password@localhost:5432/gyomu
API_KEY=your-secret-key
```

### Prisma Setup

```bash
# Generate schema from database
npx prisma db pull --schema ./prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema ./prisma/schema.prisma
```

For detailed configuration instructions: [readme_db_prisma.md](readme_db_prisma.md)

## Build and Test

```bash
# Install dependencies
pnpm install

# Build for development
pnpm run build

# Run tests
pnpm run test

# Test coverage
pnpm run test:coverage

# Linting
pnpm run lint

# Formatting
pnpm run format
```

## Supported Databases

- PostgreSQL
- MySQL
- MSSQL

For detailed configuration, see [readme_db_prisma.md](readme_db_prisma.md).

## Package Entry Points

### Main Package

```typescript
// All gyomu functionality
import {
  aesEncrypt,
  aesDecrypt,
  FileInfo,
  FileOperation,
  ResultAsync,
  BaseError,
  DBError,
  createDateFromYYYYMMDD,
  ParameterAccess,
  UserFactory,
  Configurator,
} from 'gyomu';
```

### Web Module

```typescript
// Web-related functionality
import { Page, Table, DOMElement, GenericElement } from 'gyomu/web';
```

## Code Examples and Patterns

High-quality code examples from this project are documented in detail in [exemplars.md](exemplars.md). It covers:

- [Error Handling](exemplars.md#error-handling--custom-errors) - Custom error hierarchy and type-safe error types
- [Async Result Operations](exemplars.md#result-type--async-operations) - Functional error handling with neverthrow
- [Encryption and Security](exemplars.md#encryption--security) - AES-GCM and RSA implementations
- [Database Access Patterns](exemplars.md#database-access-patterns) - Prisma integration and retry logic
- [Domain Models](exemplars.md#type-safe-domain-models) - FileInfo, User, and other entities
- [Utility Functions](exemplars.md#utility-functions--type-operations) - Base64, date, and number operations
- [Testing Patterns](exemplars.md#testing-patterns) - Comprehensive test examples
- [Configuration and DI](exemplars.md#configuration--dependency-injection) - Factory patterns and dependency injection
- [Web Components](exemplars.md#web-components--dom-operations) - Type-safe DOM manipulation

## Common Usage Patterns

### Retrieve Parameters with Retry Logic

```typescript
import { ParameterAccess } from 'gyomu';

// Retrieve parameter by key (retries up to 3 times on failure)
ParameterAccess.value('app.setting.timeout')
  .map((value) => parseInt(value, 10))
  .andThen((timeout) => validateTimeout(timeout))
  .match(
    (success) => console.log(`Timeout: ${success}ms`),
    (error) => console.error(`Failed: ${error.message}`),
  );
```

### File Encryption

```typescript
import { aesEncryptFile, aesDecryptFile, getKey } from 'gyomu';

const key = getKey('my-secret-key');

// Encrypt file
aesEncryptFile('./input.txt', './encrypted.bin', key);

// Decrypt file
aesDecryptFile('./encrypted.bin', './output.txt', key);
```

### Milestone Management

```typescript
import { Milestone } from 'gyomu';
import { createDateFromYYYYMMDD, okAsync } from 'gyomu';

const targetDate = createDateFromYYYYMMDD('20240101');

// Check milestone existence
Milestone.exists('project-milestone-1', targetDate)
  .andThen((result) => {
    if (result.exists) {
      console.log(`Last updated: ${result.updateTime}`);
    }
    return okAsync(result);
  })
  .mapErr((error) => console.error(error));
```

### Type-Safe Configuration

```typescript
import { ConfigurationFactory, UserFactory } from 'gyomu';

const user = UserFactory.getCurrentUser();
const config = ConfigurationFactory.create(user);

console.log(`Machine: ${config.machineName}`);
console.log(`Address: ${config.address}`);
console.log(`Mode: ${config.mode}`);
```

## Performance

- **Encryption**: High-speed AES-256-GCM implementation with Node.js crypto
- **File Operations**: Stream-based processing for handling large files efficiently
- **Database**: Optimized Prisma queries with connection pooling
- **Type Checking**: Compile-time type verification reduces runtime errors
- **Memory**: Efficient Buffer reuse and garbage collection

## Security Considerations

1. **Encryption Keys**: Load from environment variables, never hardcode
2. **Input Validation**: Validate all external input and enforce type constraints
3. **Authenticated Encryption**: Use AES-GCM mode to ensure both confidentiality and integrity
4. **Error Messages**: Avoid exposing sensitive implementation details in production environments
5. **Dependency Management**: Regularly update dependencies and monitor security advisories

For comprehensive security best practices: [exemplars.md - Security](exemplars.md#3-security)

## Troubleshooting

### Prisma Errors

```bash
# Clear cache and regenerate schema
rm -rf node_modules/.prisma
npx prisma generate
```

### Encryption Errors

```typescript
// Verify key length (16 or 32 bytes)
const key128 = 'abcdefghijklmnop'; // 16 bytes = AES-128 ✓
const key256 = 'abcdefghijklmnopqrstuvwxyz012345'; // 32 bytes = AES-256 ✓
```

### Invalid Key Length Error

```typescript
// Generate a proper key from string
import { getKey } from 'gyomu';

const key = getKey('my-password'); // Automatically hashed to 32 bytes
```

## Contributing

New features and bug fixes should follow the coding standards outlined in [exemplars.md](exemplars.md#recommendations-for-maintaining-code-quality):

- Implement error handling using custom error types
- Write comprehensive tests covering all scenarios
- Follow TypeScript 5.x / ES2022 guidelines
- Maintain type safety by avoiding `any` types
- Document complex patterns with JSDoc comments

## License

[License information]

## Related Documentation

- [Code Examples and Patterns (exemplars.md)](exemplars.md)
- [Database Configuration Guide](readme_db_prisma.md)
- [Test Cases](src/__tests__/)

## Support

If you encounter issues:

1. Check the relevant section in [exemplars.md](exemplars.md)
2. Review examples in [src/**tests**/](src/__tests__/)
3. Consult [readme_db_prisma.md](readme_db_prisma.md) for database-related issues
4. Review the error message and stack trace carefully

## Changelog

See [releases](https://github.com/your-org/gyomu/releases) for version history and breaking changes.

## TypeScript Support

- **Version**: TypeScript 5.x or newer
- **Target**: ES2022
- **Module System**: ESM (ES Modules only)
- **Strict Mode**: Yes, all files use strict TypeScript checking
