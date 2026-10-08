# ShapeShyft Types

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it.

TypeScript type definitions for ShapeShyft API - LLM structured output platform.

**npm**: `@sudobility/shapeshyft_types` (public)

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Bun
- **Package Manager**: Bun (do not use npm/yarn/pnpm for installing dependencies)
- **Build**: TypeScript compiler (dual ESM/CJS)
- **Test**: Vitest

## Structure

`src/index.ts` re-exports `@sudobility/shapeshyft_engine/types` (the domain
shared with ShapeRouter) and adds only ShapeShyft's own types: `LlmApiKey*`,
`ProviderIpSync*`, `ClientIpDiagnostics`, and the `Endpoint*` types that bind an
endpoint to an LLM key. To change a shared type (providers, models, pricing,
projects, analytics, response helpers), change it in `shapeshyft_engine`.

`src/export-surface.test.ts` fails if any name exported before the engine
extraction disappears. To intentionally remove an export, delete it from
`tests/fixtures/export-surface.json` in the same change.

## Project Structure

```
src/
├── index.ts                # Re-export of engine types + ShapeShyft-only types
├── index.test.ts           # Type tests
└── export-surface.test.ts  # Guards the public export list
scripts/
└── list-exports.ts         # Prints an entry file's export names
tests/fixtures/
└── export-surface.json     # Export names as of the engine extraction
dist/
├── index.js          # ESM build
├── index.cjs         # CommonJS build
└── index.d.ts        # Type declarations
```

## Commands

```bash
bun run build        # Build ESM + CJS
bun run build:esm    # Build ESM only
bun run build:cjs    # Build CJS only
bun run clean        # Remove dist/
bun run test         # Run Vitest
bun run typecheck    # TypeScript check
bun run lint         # Run ESLint
bun run format       # Format with Prettier
bun run verify       # Typecheck + lint + build
```

## Type Categories

### Enums
- `LlmProvider` - 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'cohere' | 'groq' | 'xai' | 'deepseek' | 'perplexity' | 'lm_studio' | 'jev' | 'openrouter'
- `HttpMethod` - 'GET' | 'POST'

### Entity Types (Database Models)
- `User` - User account
- `LlmApiKey` / `LlmApiKeySafe` - LLM API keys (safe version excludes encrypted data)
- `Project` - User projects
- `Endpoint` - AI endpoint configurations
- `UsageAnalytics` - Request tracking
- `UserSettings` - User preferences

### Request Types
- `UserCreateRequest`, `UserUpdateRequest`
- `LlmApiKeyCreateRequest`, `LlmApiKeyUpdateRequest`
- `ProjectCreateRequest`, `ProjectUpdateRequest`
- `EndpointCreateRequest`, `EndpointUpdateRequest`
- `AiExecutionRequest`

### Response Types
- `AiExecutionResponse`, `AiPromptResponse` (`prompt`, plus `request?: AiProviderRequest` when the caller passed `llm_provider`)
- `AnalyticsResponse`
- `RefreshApiKeyResponse`, `GetApiKeyResponse`
- `HealthCheckData`

### Query Parameter Types
- `ProjectQueryParams`
- `EndpointQueryParams`
- `UsageAnalyticsQueryParams`

### Utility Types
- `JsonSchema` - JSON Schema definition
- `ApiResponse<T>` - Standard API response wrapper (re-exported)
- `PaginatedResponse<T>` - Paginated list response (re-exported)

### Response Helpers
```typescript
import { successResponse, errorResponse } from '@sudobility/shapeshyft_types';

// Create success response
const response = successResponse({ id: '123', name: 'Test' });
// { success: true, data: { id: '123', name: 'Test' }, timestamp: '...' }

// Create error response
const error = errorResponse('Something went wrong');
// { success: false, error: 'Something went wrong', timestamp: '...' }
```

## Usage

```typescript
import type {
  User,
  Project,
  Endpoint,
  LlmProvider,
  AiExecutionRequest,
  AiExecutionResponse,
} from '@sudobility/shapeshyft_types';

import { successResponse, errorResponse } from '@sudobility/shapeshyft_types';
```

## Peer Dependencies

- `@sudobility/types` - Common Sudobility types (re-exported)

## Publishing

```bash
bun run verify          # All checks
npm publish             # Publish to npm (public)
```

## Dual Build

Supports both ESM and CommonJS:

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

## Package Hierarchy

This is the base types package used by all other ShapeShyft packages:

```
shapeshyft_engine/types (shared domain, also used by shaperouter_types)
    ↑
shapeshyft_types (this package)
    ↑
shapeshyft_client (API hooks)
    ↑
shapeshyft_lib (business logic)
    ↑
shapeshyft_app (frontend)
shapeshyft_api (backend)
```

## Workspace Context

This project is part of the **ShapeShyft** multi-project workspace at the parent directory. See `../CLAUDE.md` for the full architecture, dependency graph, and build order.

## Downstream Impact

This is the **most impactful package** in the ShapeShyft dependency chain. Changes cascade widely.

| Downstream Consumer | Relationship |
|---------------------|-------------|
| `shapeshyft_client` | Direct dependency |
| `shapeshyft_lib` | Transitive via shapeshyft_client |
| `shapeshyft_app` | Transitive + direct dependency |
| `shapeshyft_api` | Direct dependency |

After making changes:
1. `bun run verify` in this project
2. `npm publish`
3. Update in dependency order: `shapeshyft_client` -> `shapeshyft_lib` -> `shapeshyft_app`, and `shapeshyft_api`

**Be extremely careful with breaking changes.** Renaming or removing a type/field breaks multiple projects. Prefer additive changes (new optional fields, new types).

## Local Dev Workflow

```bash
# In this project:
bun link

# In each consuming project:
cd ../shapeshyft_client && bun link @sudobility/shapeshyft_types
cd ../shapeshyft_api && bun link @sudobility/shapeshyft_types

# Rebuild after changes:
bun run build

# Then rebuild consumers in order:
cd ../shapeshyft_client && bun run build
cd ../shapeshyft_lib && bun run build

# When done, unlink in each consumer:
bun unlink @sudobility/shapeshyft_types && bun install
```

## Pre-Commit Checklist

```bash
bun run verify    # Runs: typecheck -> lint -> build (does NOT include tests)
bun run test      # Run tests separately
```

## Gotchas

- **Dual ESM/CJS build** -- produces both `.js` (ESM) and `.cjs` (CJS) via two tsconfig files. The CJS build uses a rename step that copies from `dist-cjs/` to `dist/`.
- **Re-exports from `@sudobility/types`** -- `ApiResponse<T>`, `successResponse()`, `errorResponse()` are re-exported. Do not duplicate these.
- **Response helpers are runtime values, not just types** -- `successResponse()` and `errorResponse()` are actual functions.
- **`LlmApiKeySafe` vs `LlmApiKey`** -- always use `LlmApiKeySafe` in API responses. `LlmApiKey` includes encrypted data that must not be sent to clients.

## Git Workflow

- Do not use feature branches for code changes. Always stay on the current branch.
