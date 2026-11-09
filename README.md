# @sudobility/shapeshyft_types

Shared TypeScript type definitions for the ShapeShyft LLM structured-output platform.

Most of the domain (providers, models, pricing, projects, analytics, response
helpers) lives in `@sudobility/shapeshyft_engine/types` and is re-exported here
unchanged. This package adds only what is specific to ShapeShyft: per-entity LLM
API keys (`LlmApiKey` / `LlmApiKeySafe`), provider IP-sync types, and the
`Endpoint*` types that bind an endpoint to an LLM key.

ESM-only (`"type": "module"`). Ships compiled JS plus `.d.ts` declarations; the
package itself has no runtime code of its own beyond the re-exported helpers.

## Installation

This package is published to **GitHub Packages** under the `@sudobility` scope,
so consumers need an `.npmrc` pointing the scope at that registry:

```
@sudobility:registry=https://npm.pkg.github.com
```

Then install (Bun is the supported package manager):

```bash
bun add @sudobility/shapeshyft_types
```

`@sudobility/shapeshyft_engine` and `@sudobility/types` are peer dependencies and
must be installed alongside it.

## Usage

```typescript
import type {
  User, Project, Endpoint, LlmProvider,
  AiExecutionRequest, AiExecutionResponse,
} from '@sudobility/shapeshyft_types';

import { successResponse, errorResponse } from '@sudobility/shapeshyft_types';
```

## Types

- **Enums**: `LlmProvider` (`openai`, `anthropic`, `gemini`, `mistral`, `cohere`, `groq`, `xai`, `deepseek`, `perplexity`, `lm_studio`, `jev`, `openrouter`), `HttpMethod` (`GET` | `POST`)
- **Entities**: `User`, `LlmApiKey` / `LlmApiKeySafe`, `Project`, `Endpoint`, `UsageAnalytics`, `UserSettings`
- **Requests**: Create/Update types for users, keys, projects, endpoints, plus `AiExecutionRequest`
- **Responses**: `AiExecutionResponse`, `AiPromptResponse`, `AnalyticsResponse`, `HealthCheckData`, `RefreshApiKeyResponse`, `GetApiKeyResponse`
- **Query Params**: `ProjectQueryParams`, `EndpointQueryParams`, `UsageAnalyticsQueryParams`
- **Provider IP sync**: `ProviderIpSyncResponse`, `ClientIpDiagnostics` (and the per-bucket entry types)
- **Utilities**: `JsonSchema`, `ApiResponse<T>`, `PaginatedResponse<T>`, `ModelPricing` (re-exported from the engine)
- **Helpers (runtime functions)**: `successResponse()`, `errorResponse()`, `estimateCost()`, `formatCost()`, `isValidModelForProvider()`, and the `PROVIDER_MODELS` / `LLM_PROVIDERS` catalogs — all re-exported from the engine

`LlmApiKey` / `ProviderIpSync*` / `ClientIpDiagnostics` / `Endpoint*` are defined
in this package; everything else is re-exported from
`@sudobility/shapeshyft_engine/types` via `export *`.

> Use `LlmApiKeySafe` (not `LlmApiKey`) in anything sent to a client.
> `LlmApiKey` carries encrypted credential fields that must never leave the server.

## Development

```bash
bun install          # Install deps (Bun only; do not use npm/yarn/pnpm)
bun run build        # Compile ESM + declarations to dist/ (tsc -p tsconfig.esm.json)
bun run clean        # Remove dist/
bun run dev          # tsc --watch
bun run typecheck    # tsc --noEmit
bun run lint         # ESLint over src/
bun run format       # Prettier --write over src/
bun run test:unit    # Run Vitest once (bun run test:watch for watch mode)
bun run verify       # typecheck -> lint -> build (does NOT run tests)
```

## Related Packages

- `@sudobility/shapeshyft_engine` -- shared domain (re-exported here); also feeds ShapeRouter
- `@sudobility/shapeshyft_client` -- React hooks for the ShapeShyft API
- `@sudobility/shapeshyft_lib` -- business logic with Zustand stores
- `shapeshyft_api` -- backend API server
- `shapeshyft_app` -- frontend web application

## License

BUSL-1.1
