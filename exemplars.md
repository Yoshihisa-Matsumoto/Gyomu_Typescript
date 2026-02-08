# Code Exemplars Blueprint

## Document Purpose

This document identifies high-quality, representative code examples from the **gyomu** TypeScript library that demonstrate our coding standards and architectural patterns. These exemplars serve as references for maintaining consistency, promoting best practices, and guiding implementation of new features across the codebase.

The **gyomu** project is a comprehensive utility library built with TypeScript 5.x targeting ES2022, featuring utility modules for encryption, file operations, database interactions, date/time operations, and web components.

---

## Table of Contents

1. [Error Handling & Custom Errors](#error-handling--custom-errors)
2. [Result Type & Async Operations](#result-type--async-operations)
3. [Encryption & Security](#encryption--security)
4. [Database Access Patterns](#database-access-patterns)
5. [Type-Safe Domain Models](#type-safe-domain-models)
6. [Utility Functions & Type Operations](#utility-functions--type-operations)
7. [Testing Patterns](#testing-patterns)
8. [Configuration & Dependency Injection](#configuration--dependency-injection)
9. [Web Components & DOM Operations](#web-components--dom-operations)
10. [Module Organization & Exports](#module-organization--exports)

---

## Error Handling & Custom Errors

### Hierarchical Error Class Pattern

**File:** [src/errors.ts](src/errors.ts)

This file demonstrates a well-structured error hierarchy using custom Error classes extending a base class. This pattern enables:

- Type-safe error handling with discriminated error types
- Chaining of inner errors for debugging context
- Semantic error classification (ValueError, DBError, NetworkError, etc.)
- Proper error propagation without losing stack traces

**Key Principles:**

- Custom errors extend a `BaseError` class that preserves the inner error context
- Each error type represents a specific error domain (database, validation, parsing, network)
- Constructor consistently accepts a message and optional `innerError` parameter
- Enables catch blocks to handle errors by type with full type safety

**Exemplar Snippet:**

```typescript
export class BaseError extends Error {
  innerError?: unknown;

  constructor(message: string, innerError?: unknown) {
    super(message);
    this.innerError = innerError;
  }
}

export class DBError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}
```

**Related Exemplars:**

- [Database Access Patterns](#database-access-patterns) - Shows how custom errors integrate with database operations

---

## Result Type & Async Operations

### Neverthrow Integration & Async Result Handling

**File:** [src/result.ts](src/result.ts)

This module demonstrates advanced functional error handling using the `neverthrow` library, providing type-safe error handling without try/catch blocks. Key features:

- `Result<T, E>` and `ResultAsync<T, E>` types for explicit error handling
- Chainable operations with `.map()`, `.andThen()`, `.orElse()` methods
- Conversion utilities between sync and async results
- Re-export of neverthrow utilities for consistent library API

**Key Principles:**

- Avoids exception-based control flow
- Enables composition of error-prone operations
- Type system enforces handling of both success and failure paths
- Supports retry logic and error recovery patterns

**Exemplar Snippet:**

```typescript
export function result2Async<T, E>(r: Result<T, E>): ResultAsync<T, E> {
  return r.isOk() ? okAsync(r.value) : errAsync(r.error);
}
```

**Related Exemplars:**

- [Database Access Patterns](#database-access-patterns) - Integration with ResultAsync
- [Testing Patterns](#testing-patterns) - Testing async result operations

---

## Encryption & Security

### Comprehensive Encryption Utilities

**File:** [src/encryption.ts](src/encryption.ts)

This extensive module demonstrates security best practices in TypeScript, including:

- AES-GCM symmetric encryption with proper key validation
- PKI/RSA asymmetric encryption and decryption
- File-based encryption operations
- Key management from files and strings
- Compatibility with external encryption systems (e.g., C#)

**Key Principles:**

- Validates key length (16 or 32 bytes for AES-128/256)
- Uses random IVs for each encryption operation
- Includes authentication tags for GCM mode integrity verification
- Demonstrates integration with the `node-forge` library for PKI operations
- Handles both Buffer and ArrayBuffer abstractions seamlessly

**Exemplar Snippet (from line 20-50 of src/encryption.ts):**

```typescript
export const aesEncrypt = (plain: string, key: string): string => {
  const originalBuffer = stringToArrayBuffer(plain);
  const encryptedBuffer = aesEncryptBuffer(originalBuffer, getKey(key));
  return buffer2Base64String(encryptedBuffer);
};

export const aesEncryptBuffer = (
  plainBuffer: ArrayBuffer,
  keyBuffer: ArrayBuffer,
): Buffer => {
  const keyLength = keyBuffer.byteLength;
  if (keyLength !== 16 && keyLength !== 32)
    throw new Error('Invalid Key Length');

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    encryptionKey,
    iv,
  );
  // ... secure encryption implementation
};
```

**Security Best Practices Demonstrated:**

- Input validation for key length before processing
- Use of authenticated encryption (AES-GCM) over unauthenticated modes
- Random IV generation per encryption
- Error handling for cryptographic failures

**Related Exemplars:**

- [Testing Patterns](#testing-patterns) - Encryption test cases with edge cases
- [Utility Functions & Type Operations](#utility-functions--type-operations) - Buffer and Base64 conversions

---

## Database Access Patterns

### Type-Safe Database Operations with ResultAsync

**File:** [src/dbutil.ts](src/dbutil.ts)

This module demonstrates a factory pattern for database operations that:

- Wraps Prisma client calls with comprehensive error handling
- Converts exceptions to `ResultAsync<T, DBError>` for type-safe error handling
- Distinguishes between recoverable errors (DBError) and critical failures (CriticalError)
- Provides a reusable pattern for all database operations

**Key Principles:**

- Generic function accepts action name for better error messages
- Maps Prisma-specific errors to domain error types
- Identifies and re-throws critical errors (Rust panics) to terminate application
- Ensures consistent error handling across all database calls

**Exemplar Snippet:**

```typescript
export function genericDBFunction<T>(
  actionName: string,
  dbFunc: (...args: any[]) => Promise<T>,
  args: any[],
): ResultAsync<T, DBError> {
  return ResultAsync.fromPromise(dbFunc(...args), (e) => {
    // Prisma-specific error handling
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientUnknownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      return new DBError(`Fail: ${actionName}`, e as Error);
    }

    // Critical errors are re-thrown
    if (e instanceof Prisma.PrismaClientRustPanicError) {
      throw new CriticalError(
        'Critical error on Prisma. Need to terminate the application',
        e as Error,
      );
    }

    return new DBError(`Unknown Failure: ${actionName}`, e as Error);
  });
}
```

**Architecture Benefits:**

- Eliminates try/catch blocks in calling code
- Type system enforces error handling
- Provides actionable error messages
- Enables automatic retries via chainable operations

**Related Exemplars:**

- [Parameter Access with Retry Logic](#parameter-access-with-retry-logic) - Advanced usage with retries
- [Error Handling & Custom Errors](#error-handling--custom-errors) - Error type definitions

---

### Parameter Access with Retry Logic

**File:** [src/parameter.ts](src/parameter.ts)

This file exemplifies advanced functional error handling patterns:

- Implements retry logic for transient failures
- Uses `ResultAsync` chainable methods for composition
- Demonstrates conditional logic within async result chains
- Shows user context integration for parameterized queries

**Key Principles:**

- `retryResultAsync` function enables automatic retries with exponential behavior
- Chain methods like `.map()` and `.andThen()` for readable error handling
- Private helper methods (`#loadParameter`) encapsulate data access
- Supports optional parameters (user context, target date) for flexible queries

**Exemplar Snippet:**

```typescript
export const retryResultAsync = <T, E>(
  fn: () => ResultAsync<T, E>,
  maxRetry: number,
): ResultAsync<T, E> => {
  return fn().orElse((err) =>
    maxRetry > 1 ? retryResultAsync(fn, maxRetry - 1) : errAsync(err),
  );
};

export class ParameterAccess {
  static value(
    key: string,
    user?: User,
    targetDate?: Date,
  ): ResultAsync<string, DBError> {
    const itemKey = this.getKey(key, user);

    return retryResultAsync(() => this.#loadParameter(itemKey), 3).andThen(
      (itemValues) => {
        if (!itemValues || itemValues.length === 0) {
          return errAsync(new DBError('Unknown error on retrieving parameter'));
        }
        return okAsync(itemValues[0].item_value);
      },
    );
  }

  static #loadParameter(
    key: string,
  ): ResultAsync<gyomu_param_master[], DBError> {
    return genericDBFunction<gyomu_param_master[]>(
      'load gyomu_param_master',
      async (key) =>
        prisma.gyomu_param_master.findMany({
          where: { item_key: key },
        }),
      [key],
    );
  }
}
```

**Design Patterns:**

- Retry logic through recursive `ResultAsync` composition
- Private methods for internal operations (name-mangled with `#`)
- Static class methods for stateless parameter access
- Integration with user context for multi-tenant scenarios

---

## Type-Safe Domain Models

### File Information Abstraction

**File:** [src/fileModel.ts](src/fileModel.ts)

This module demonstrates robust domain model design:

- Encapsulates file system metadata in a strongly-typed class
- Uses readonly properties to prevent accidental mutations
- Provides discriminated type definitions for different filter and comparison operations
- Handles both files and directories transparently

**Key Principles:**

- Constructor extracts metadata at initialization time
- Readonly properties enforce immutability after construction
- Discriminated union types for different operational modes (FilterType, FileCompareType, FileArchiveType)
- Defensive programming with existence checks and type narrowing

**Exemplar Snippet:**

```typescript
export class FileInfo {
  readonly fileName: string;
  readonly fullPath: string;
  readonly directoryName: string;
  readonly directoryPath: string;
  readonly size: number;
  readonly extension: string;
  readonly createTime: Date;
  readonly updateTime: Date;
  readonly lastAccessTime: Date;
  readonly isFile: boolean;

  constructor(filePath: string) {
    const stats = platform.statSync(filePath);
    this.isFile = stats.isFile();
    if (this.isFile) {
      this.fileName = platform.basename(filePath);
      this.fullPath = platform.resolve(filePath);
      // ... additional initialization
    }
    this.size = stats.size;
    this.createTime = stats.birthtime;
    this.updateTime = stats.mtime;
    this.lastAccessTime = stats.atime;
  }
}
```

**Type Safety Features:**

```typescript
export const FilterType = {
  FileName: 'Name',
  CreateTime: 'Create Time',
  LastAccessTime: 'Last Access Time',
  LastModifiedTime: 'Last Modified Time',
} as const;

export type FilterType = (typeof FilterType)[keyof typeof FilterType];
```

This pattern creates a single source of truth for allowed values and their type.

**Related Exemplars:**

- [Configuration & Dependency Injection](#configuration--dependency-injection) - User domain model
- [Testing Patterns](#testing-patterns) - File comparison testing utilities

---

## Utility Functions & Type Operations

### Base64 Encoding/Decoding

**File:** [src/base64.ts](src/base64.ts)

This module exemplifies simple, focused utility functions that abstract platform differences:

- Converts between string, Buffer, and Base64 representations
- Provides consistent encoding/decoding across the library
- Handles both ASCII and UTF-8 content

**Key Principles:**

- Functions are pure and side-effect free
- Consistent naming: `<source>2<destination>`
- Reuses platform abstractions (Buffer operations)
- Clear type signatures showing input/output transformations

**Exemplar Snippet:**

```typescript
export type SupportEncoding = 'shiftjis' | 'utf8';

export const string2Base64String = (plainString: string): string => {
  return buffer2Base64String(Buffer.from(plainString));
};

export const buffer2Base64String = (buffer: Buffer): string => {
  return buffer.toString('base64');
};

export const base64String2String = (encodedString: string): string => {
  return base64String2Buffer(encodedString).toString();
};

export const base64String2Buffer = (encodedString: string): Buffer => {
  return Buffer.from(encodedString, 'base64');
};
```

**Design Benefits:**

- Centralized encoding logic prevents duplication
- Easy to extend with new encoding types
- Enables composition (e.g., string → buffer → Base64)

---

### Numeric Operations with Precision Control

**File:** [src/numberOperation.ts](src/numberOperation.ts)

This utility demonstrates mathematical operations with precision management:

- Provides rounding, ceiling, and floor operations with arbitrary decimal places
- Solves floating-point precision issues in JavaScript
- Consistent API across three different rounding strategies

**Key Principles:**

- Uses power-of-10 adjustment for decimal precision
- Returns number (not string) for type safety
- Special case for zero digit to use native Math methods
- Clear naming indicates rounding direction

**Exemplar Snippet:**

```typescript
export const toHalfAdjust = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.round(targetNumber);

  const adjust = Math.pow(10, digit);
  return Math.round(targetNumber * adjust) / adjust;
};

export const toRoundUp = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.ceil(targetNumber);

  const adjust = Math.pow(10, digit);
  return Math.ceil(targetNumber * adjust) / adjust;
};

export const toRoundDown = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.floor(targetNumber);

  const adjust = Math.pow(10, digit);
  return Math.floor(targetNumber * adjust) / adjust;
};
```

**API Design:**

- Consistent parameter order and naming
- Returns primitive type for easy chaining
- No side effects (pure functions)

---

### Date Operations

**File:** [src/dateOperation.ts](src/dateOperation.ts)

This module demonstrates date/time manipulation with a focus on date-only precision:

- Creates Date objects from component parts
- Parses YYYYMMDD string format
- Extracts date-only portion (midnight UTC)
- Handles month as 1-based for user convenience

**Key Principles:**

- Normalizes dates to midnight UTC to avoid timezone issues
- YYYYMMDD is a common format in Japanese business systems
- Uses string padding for safe date parsing
- Immutable operations return new Date instances

**Exemplar Snippet:**

```typescript
export const createDateOnly = (
  year: number,
  one_base_month: number,
  day: number,
) => {
  const dateString = `${year}-${('00' + one_base_month).slice(-2)}-${(
    '00' + day
  ).slice(-2)}`;
  return new Date(dateString);
};

export const createDateFromYYYYMMDD = (yyyyMMdd: string) => {
  const dateString =
    yyyyMMdd.substring(0, 4) +
    '-' +
    yyyyMMdd.substring(4, 6) +
    '-' +
    yyyyMMdd.substring(6);
  return new Date(dateString);
};

export const extractDateOnly = (date: Date) => {
  const dateString = `${date.getFullYear()}-${(
    '00' +
    (date.getMonth() + 1)
  ).slice(-2)}-${('00' + date.getDate()).slice(-2)}`;
  return new Date(dateString);
};
```

**Defensive Practices:**

- String padding prevents ambiguous date parsing
- ISO format usage ensures consistent parsing
- Date-only extraction removes time component

---

## Testing Patterns

### Comprehensive Encryption Tests

**File:** [src/**tests**/aes-encryption.test.ts](src/__tests__/aes-encryption.test.ts)

This test suite exemplifies thorough testing of security-sensitive code:

- Tests normal operation with various key sizes
- Validates cross-language compatibility (C# interoperability)
- Tests error conditions and invalid inputs
- Covers both text and binary encryption scenarios
- Uses temporary files for integration testing

**Key Testing Principles:**

- **Positive Tests**: Basic encrypt/decrypt with multiple key sizes
- **Negative Tests**: Invalid key lengths, wrong decryption keys
- **Integration Tests**: File-based encryption with real temporary files
- **Compatibility Tests**: Decryption of data encrypted by other systems
- **Internationalization**: Japanese character support verification
- **Error Handling**: Validates proper exception throwing

**Exemplar Snippet:**

```typescript
test('Normal AES Encrypt/Decrypt Test', () => {
  const plain = 'Hello$Test';
  const key = 'abc';
  const encData = aes.aesEncrypt(plain, key);
  expect(plain).toEqual(aes.aesDecrypt(encData, key));

  const key2 = 'abcdefghijklmnop';
  const encData2 = aes.aesEncrypt(plain, key2);
  expect(plain).toEqual(aes.aesDecrypt(encData2, key2));
});

test('AES Decrypt Error Test', () => {
  const plain = 'Hello$Test';
  const key = 'abc';
  const encData = aes.aesEncrypt(plain, key);
  const key2 = 'abcdefghijklmnop';
  expect(() => {
    aes.aesDecrypt(encData, key2);
  }).toThrow('Unsupported state or unable to authenticate data');
});

test('Invalid AES Key Encrypt Test', () => {
  const plain = 'Hello$Test';
  const key = 'abcdefghijklmnoprstuvwxyz012345678';
  expect(() => {
    aes.aesEncrypt(plain, key);
  }).toThrow('Invalid Key Length:');
});
```

**Test Organization:**

- One assertion per test (mostly)
- Descriptive test names indicating what is being tested
- Uses `expect().toThrow()` for error validation
- File-based tests use cleanup (through vitest fixtures)

---

### Test Utility Functions

**File:** [src/**tests**/baseClass.ts](src/__tests__/baseClass.ts)

This module provides reusable test utilities demonstrating the DRY principle:

- File comparison function for byte-for-byte validation
- Folder comparison from both source and destination directions
- Uses test assertions within utilities for clear failure messages
- Recursive directory traversal for comprehensive validation

**Key Testing Utilities:**

- `compareFiles()` - Validates file contents match exactly
- `validateFolders()` - Bidirectional folder comparison
- `compareFoldersFromSource()` - Ensures all source files exist in destination
- `compareFoldersFromDest()` - Ensures no extra files in destination

**Exemplar Snippet:**

```typescript
export const compareFiles = (srcFile: string, destFile: string): boolean => {
  const result = platform
    .readFileSync(srcFile)
    .equals(platform.readFileSync(destFile));
  if (!result) {
    console.log(srcFile, destFile);
  }
  return result;
};

export const validateFolders = (srcFolder: string, destFolder: string) => {
  expect(compareFoldersFromSource(srcFolder, destFolder)).toBeTruthy();
  expect(compareFoldersFromDest(srcFolder, destFolder)).toBeTruthy();
};
```

**Design Benefits:**

- Reusable across multiple test files
- Clear separation of test assertion from comparison logic
- Recursive approach handles nested directories
- Bidirectional validation prevents false positives

**Related Exemplars:**

- [Encryption & Security](#encryption--security) - Uses test utilities for file operations
- [Configuration & Dependency Injection](#configuration--dependency-injection) - Testing configuration objects

---

## Configuration & Dependency Injection

### Configuration Factory Pattern

**File:** [src/configurator.ts](src/configurator.ts)

This module demonstrates dependency injection and factory patterns:

- Encapsulates system configuration (machine name, network address, user context)
- Provides mutable application ID alongside immutable system properties
- Uses factory pattern for creating configured instances
- Integrates user context through composition

**Key Design Principles:**

- **Separation of Concerns**: Configuration logic separated from retrieval
- **Immutability**: Most properties readonly; only applicationId is mutable
- **Interface Segregation**: `Configurator` interface defines minimal contract
- **Factory Pattern**: `ConfigurationFactory` creates instances with validation
- **Environment Integration**: Reads from Node.js `process.env`

**Exemplar Snippet:**

```typescript
export interface Configurator {
  readonly machineName: string;
  readonly address: string;
  readonly userId: string;
  readonly uniqueInstanceIdPerMachine: number;
  readonly region: string;
  readonly user: User;
  readonly mode: string;
  applicationId: () => number;
  setApplicationId: (id: number) => void;
}

class BaseConfigurator implements Configurator {
  readonly user: User;
  readonly userId: string;
  readonly machineName: string;
  readonly address: string;
  readonly uniqueInstanceIdPerMachine: number;
  readonly region: string;
  readonly mode: string;

  constructor(user: User, applicationId: number = -1) {
    this.user = user;
    this.userId = user.userId;
    this.machineName = hostname();

    const nets = networkInterfaces();
    const net = nets['en0']?.find((v) => v.family === 'IPv4');
    this.address = net ? net.address : '';
    this.#applicationId = applicationId;
    this.uniqueInstanceIdPerMachine = pid;
    this.region = this.user.region;
    this.mode = env.GYOMU_COMMON_MODE || 'Development';
  }

  #applicationId: number;
  applicationId = () => this.#applicationId;
  setApplicationId = (id: number) => {
    this.#applicationId = id;
  };
}
```

**Encapsulation Techniques:**

- Private field `#applicationId` with public accessor methods
- Read-only properties for system state
- Constructor injection of dependencies (User)
- Optional parameters with sensible defaults

---

### User Abstraction & Factory

**File:** [src/user.ts](src/user.ts)

This module exemplifies interface-based design with factory pattern:

- Defines `User` interface for polymorphic user representations
- Provides concrete `DummyUser` implementation for testing
- Uses factory method for user creation
- Includes group membership and validation methods

**Key Design Principles:**

- **Interface Segregation**: `User` interface defines capabilities
- **Factory Method**: `UserFactory.getCurrentUser()` decouples user retrieval
- **Testability**: Easy to mock user context in tests
- **Extensibility**: New user implementations can be added without changing consumers

**Exemplar Snippet:**

```typescript
export interface User {
  isGroup: boolean;
  isValid: boolean;
  userId: string;
  isEqual: (other: User) => boolean;
  isInMember: (groupUser: User) => boolean;
  region: string;
}

class DummyUser implements User {
  isGroup = false;
  isValid = true;
  userId: string;

  constructor(uid: string) {
    this.userId = uid;
  }

  isEqual = (other: User) => {
    return this.userId === other.userId;
  };

  isInMember = () => {
    return false;
  };

  region: string = '';
}

export class UserFactory {
  static getCurrentUser = (): User => {
    return new DummyUser('testUid');
  };
}
```

**Testability Benefits:**

- `DummyUser` provides predictable test behavior
- Factory pattern enables dependency injection
- Interface allows multiple implementations
- Methods are arrow functions for proper `this` binding

---

## Web Components & DOM Operations

### Generic Web Element Abstraction

**File:** [src/web/util.ts](src/web/util.ts)

This module demonstrates type-safe DOM manipulation using TypeScript's mapped types:

- Converts HTML elements to custom wrapper classes
- Uses discriminated unions with mapped types for type safety
- Maintains parallel type mappings for options and results
- Works with both real HTML elements and generic element abstractions

**Key Design Principles:**

- **Mapped Types**: `ElementTagNameMap` and `ElementOptionTagNameMap` create single source of truth
- **Generic Constraints**: K extends multiple mapped types for exhaustive checking
- **Type Safety**: Compiler enforces correct option types per element type
- **Extensibility**: Easy to add new element types without refactoring

**Exemplar Snippet:**

```typescript
export type ElementGenerationOption = TableOption;

interface ElementOptionTagNameMap {
  table: TableOption;
}

interface ElementTagNameMap {
  table: Table;
}

export function convertHTMLElementByTagName<
  K extends keyof HTMLElementTagNameMap &
    keyof ElementOptionTagNameMap &
    keyof ElementTagNameMap,
>(
  qualifiedName: K,
  element: HTMLElementTagNameMap[K],
  option: ElementOptionTagNameMap[K],
): ElementTagNameMap[K] {
  switch (qualifiedName) {
    case 'table':
      return new Table(element, option as ElementOptionTagNameMap[K]);
  }
  throw new Error('Unknown Error');
}
```

**Advanced TypeScript Features:**

- Intersection of multiple `keyof` constraints for comprehensive type checking
- Parallel interface mappings prevent duplication and ensure consistency
- Switch statement ensures exhaustiveness through TypeScript's narrowing
- Generic type parameter connects all three mapping interfaces

---

### Web Module Exports

**File:** [src/web/index.ts](src/web/index.ts)

This module exemplifies clean barrel exports:

- Exports all public APIs from the web module
- Enables convenient imports from package: `import { Page, Table } from 'gyomu/web'`
- Clear, organized export structure

**Exemplar Pattern:**

```typescript
export { Page, PageOption, PageResponseOption, PageTextOption } from './page';
export { Attribute } from './attribute';
export { DOMElement, GenericElement } from './element';
export { Table } from './table';
export { TableRow } from './tableRow';
export { TableColumn } from './tableColumn';
export {
  convertGenericElementByTagName,
  convertHTMLElementByTagName,
} from './util';
```

**Best Practices:**

- Named exports enable tree-shaking
- Barrel export simplifies consumer code
- Clear organization visible from exports alone

---

## Module Organization & Exports

### Main Library Barrel Export

**File:** [src/index.ts](src/index.ts)

This module serves as the library's main entry point, demonstrating effective module organization:

- Re-exports all core utilities for convenient consumption
- Establishes the public API surface
- Maintains internal/external module boundaries

**Exemplar Pattern:**

```typescript
export * from './base64';
export * from './buffer';
export * from './configurator';
export * from './dictionary';
export * from './errors';
export * from './fileModel';
export * from './fileOperation';
export * from './numberOperation';
export * from './result';
export * from './user';
export * from './platform';
```

**Design Benefits:**

- Single import for all utilities: `import { aesEncrypt, FileInfo } from 'gyomu'`
- Easy to identify library's public interface
- Future refactoring (moving files) doesn't affect consumers
- Enables subpath exports in package.json for code splitting

**Related Package Configuration** (from package.json):

```json
{
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "types": "./lib/index.d.ts"
    },
    "./web": {
      "import": "./lib/web/index.js",
      "types": "./lib/web/index.d.ts"
    }
  }
}
```

This enables multiple entry points while maintaining type safety.

---

## Consistency Patterns Observed

### 1. **Error Handling Pattern**

- Custom error hierarchy extends `BaseError` with inner error context
- `DBError` for database operations, validated with type guards
- Errors used in `ResultAsync<T, E>` for type-safe error handling
- No exception-based control flow in async code

### 2. **Result Type Pattern**

- Functional error handling using `neverthrow` library
- Chainable operations (.map, .andThen, .orElse) instead of try/catch
- Retry logic through recursive `ResultAsync` composition
- Type system enforces error handling

### 3. **Domain Model Pattern**

- Readonly properties after construction for immutability
- Discriminated union types via `as const` for type-safe enums
- Separate types and values to prevent duplication
- Encapsulation of initialization logic in constructors

### 4. **Utility Module Pattern**

- Pure functions with clear transformation signatures
- Naming convention: `<source>2<destination>` (e.g., `string2Base64String`)
- Reuse platform abstractions (Buffer, FileInfo) instead of duplicating logic
- Focused modules with single responsibility

### 5. **Factory Pattern**

- Static factory methods for creating instances with validation
- Decouples instantiation from consumers
- Enables dependency injection for testability
- Used for configuration, users, and domain objects

### 6. **Interface-Based Design**

- Interfaces define contracts without implementation details
- Multiple implementations possible (real, dummy/test, etc.)
- Enables polymorphism and composition
- Clear separation of capabilities

### 7. **Database Access Pattern**

- Generic wrapper function for all Prisma calls
- Converts exceptions to ResultAsync for type safety
- Maps framework-specific errors to domain errors
- Critical errors re-thrown to maintain invariants

### 8. **Testing Pattern**

- Comprehensive test suites with positive, negative, and integration cases
- Reusable test utilities in separate test base classes
- Descriptive test names indicating behavior being tested
- Uses vitest with type checking

---

## Architecture Observations

### Layered Architecture

The codebase exhibits clear separation of concerns:

1. **Cryptographic Layer** (encryption.ts)
   - Handles AES and PKI encryption independently
   - Integrates Node.js crypto and node-forge libraries
   - Provides high-level string/buffer API

2. **Data Access Layer** (dbutil.ts, parameter.ts)
   - Generic database function wrapper for Prisma
   - Converts exceptions to ResultAsync
   - Retry logic for transient failures
   - Type-safe parameter access

3. **Domain Models** (fileModel.ts, user.ts)
   - Encapsulate entity data and metadata
   - Provide methods for entity behavior
   - Used throughout application for type safety

4. **Utility Layer** (base64.ts, dateOperation.ts, numberOperation.ts)
   - Pure functions for common operations
   - No side effects or state
   - High reusability across modules

5. **Configuration Layer** (configurator.ts)
   - System configuration abstraction
   - Dependency injection of user context
   - Environment-aware setup

6. **Presentation Layer** (web/\*.ts)
   - DOM element wrappers for type-safe manipulation
   - Table component with configuration options
   - Generic element abstraction for extensibility

### Cross-Cutting Concerns

1. **Error Handling**: Consistent error hierarchy with context preservation
2. **Type Safety**: Extensive use of TypeScript's type system features
3. **Immutability**: Readonly properties and pure functions preferred
4. **Testability**: Dependency injection, factory patterns, and interface segregation
5. **Reusability**: Utility functions and abstractions shared across modules

---

## Implementation Conventions

### Naming Conventions

- **Classes & Types**: PascalCase (`FileInfo`, `BaseError`, `ParameterAccess`)
- **Functions & Variables**: camelCase (`aesEncrypt`, `retryResultAsync`, `extractDateOnly`)
- **Constants**: UPPER_CASE with `as const` for type unions
- **Private Fields**: Name-mangled with `#` prefix (`#applicationId`)
- **File Names**: kebab-case or camelCase per module (e.g., `dateOperation.ts`, `base64.ts`)

### Code Organization

- **Readonly Properties**: Preferred for immutable state after construction
- **Arrow Functions in Classes**: Used for proper `this` binding in callbacks
- **Private Helper Methods**: Name-mangled with `#` for true privacy
- **Static Methods**: Used for stateless operations (factories, utilities)
- **Generic Functions**: Heavy use of TypeScript generics for reusability

### Import Organization

- Standard library imports first
- Third-party imports second
- Local relative imports third
- Named exports preferred over default exports (supports tree-shaking)

---

## Anti-Patterns to Avoid

### 1. **Avoid Exception-Based Control Flow**

❌ Don't: `try/catch` for expected errors

```typescript
try {
  const result = await dbOperation();
} catch (e) {
  handleError(e);
}
```

✅ Do: Use `ResultAsync` for type-safe error handling

```typescript
dbOperation()
  .andThen(processResult)
  .mapErr(handleError)
  .match(success, failure);
```

### 2. **Avoid Implicit `any` Types**

❌ Don't: Omit return types in functions handling errors

```typescript
export function parseData(input) {
  // ...
}
```

✅ Do: Explicitly type all function signatures

```typescript
export function parseData(input: string): Result<Data, ParseError> {
  // ...
}
```

### 3. **Avoid Mutable State in Utilities**

❌ Don't: Store state in utility modules

```typescript
let cachedValue: any;
export function getData() {
  if (!cachedValue) cachedValue = expensiveOperation();
  return cachedValue;
}
```

✅ Do: Pure functions without side effects

```typescript
export function transformData(input: Data): TransformedData {
  return {
    /* transformation */
  };
}
```

### 4. **Avoid Hardcoded Secrets**

❌ Don't: Include secrets in source code

```typescript
const apiKey = 'super-secret-key-12345';
```

✅ Do: Load from secure configuration

```typescript
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('Missing API_KEY environment variable');
```

### 5. **Avoid Weak Error Context**

❌ Don't: Generic error messages

```typescript
throw new Error('Failed');
```

✅ Do: Descriptive errors with context

```typescript
throw new DBError(`Failed to retrieve parameter: ${key}`, originalError);
```

### 6. **Avoid Large Single-Purpose Classes**

❌ Don't: Classes with too many responsibilities

```typescript
class DataProcessor {
  // 200 lines of encryption, parsing, database, and validation logic
}
```

✅ Do: Smaller focused classes using composition

```typescript
class ParameterAccess {
  static value(): ResultAsync<string, DBError> {
    /* ... */
  }
}
```

---

## Recommendations for Maintaining Code Quality

### 1. **Error Handling**

- Always use custom error types from [src/errors.ts](src/errors.ts)
- Preserve inner error context using `innerError` parameter
- Use `ResultAsync<T, DBError>` for database operations via [src/dbutil.ts](src/dbutil.ts)
- Wrap Prisma errors with meaningful action descriptions

### 2. **Type Safety**

- Avoid `any` types; use `unknown` with type guards
- Leverage discriminated unions for state machines (see FileCompareType pattern)
- Use `as const` for creating type-safe enums from values
- Utilize generic constraints for compile-time verification

### 3. **Security**

- Follow encryption best practices from [src/encryption.ts](src/encryption.ts)
- Validate input types and lengths before cryptographic operations
- Use authenticated encryption (AES-GCM) over unauthenticated modes
- Load configuration from environment, never hardcode secrets
- Use `Readonly<>` type utilities to prevent accidental mutations

### 4. **Testing**

- Write comprehensive tests covering positive, negative, and integration cases
- Use test utilities from [src/**tests**/baseClass.ts](src/__tests__/baseClass.ts) for reusability
- Test error conditions explicitly with `.toThrow()`
- Validate cross-system compatibility (e.g., encryption with C#)
- Include internationalization tests for string handling

### 5. **Code Organization**

- Keep modules focused with single responsibility principle
- Use barrel exports (index.ts) for clean public APIs
- Group related utilities in focused modules
- Place tests near their implementation
- Use platform abstraction [src/platform](src/platform) for OS-specific operations

### 6. **Documentation**

- Document complex patterns with inline comments explaining intent
- Provide JSDoc for public APIs with `@param`, `@returns`, and `@example`
- Maintain this exemplars document as code evolves
- Document new error types and their recovery strategies
- Update architecture documentation when introducing major patterns

---

## Conclusion

The **gyomu** codebase demonstrates strong software engineering practices through:

- **Type-Safe Error Handling**: Custom error hierarchy with `ResultAsync` for predictable error flows
- **Functional Composition**: Chainable operations instead of exception-based control flow
- **Security Focus**: Comprehensive encryption utilities with input validation
- **Clean Architecture**: Clear separation of concerns across layers
- **Testability**: Dependency injection, factory patterns, and interface segregation
- **Maintainability**: Focused modules, reusable utilities, and consistent patterns

New code should follow the patterns established in these exemplars to maintain consistency and benefit from the architecture already in place. When extending the codebase, reference these exemplars to ensure alignment with established standards.

For questions about implementing new features consistent with existing patterns, refer to:

- Error handling patterns in [src/errors.ts](src/errors.ts) and [src/dbutil.ts](src/dbutil.ts)
- Async result patterns in [src/result.ts](src/result.ts) and [src/parameter.ts](src/parameter.ts)
- Domain model patterns in [src/fileModel.ts](src/fileModel.ts) and [src/user.ts](src/user.ts)
- Testing patterns in [src/**tests**/](src/__tests__) directory
- Configuration patterns in [src/configurator.ts](src/configurator.ts)
