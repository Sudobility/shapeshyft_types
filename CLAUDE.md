# ShapeShyft Types

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it. Do not use feature branches — stay on the
> current branch.

Shared TypeScript type definitions for the ShapeShyft API (an LLM structured-output platform).
npm name: `@sudobility/shapeshyft_types`.

## Tech Stack

- **Language**: TypeScript (`~5.9`), ESM-only (`"type": "module"`)
- **Package manager / runtime**: Bun — do NOT use npm/yarn/pnpm to install deps
- **Build**: `tsc` → `dist/` (ESM `.js` + `.d.ts`). There is **no** CJS build.
- **Test**: Vitest
- **Lint/format**: ESLint + Prettier

## Architecture

`src/index.ts` re-exports `@sudobility/shapeshyft_engine/types` with `export *`
(types AND runtime values like `successResponse`, `PROVIDER_MODELS`), then adds
ONLY ShapeShyft's own definitions:

- `LlmApiKey` / `LlmApiKeySafe` + their create/update requests
- `ProviderIpSync*` and `ClientIpDiagnostics`
- `Endpoint` / `EndpointCreateRequest` / `EndpointUpdateRequest` — extend the
  engine's `Endpoint*Base` and bind an endpoint to an `LlmApiKey` via `llm_key_id`

To change a shared type (providers, models, pricing, projects, analytics,
response helpers), change it in **`shapeshyft_engine`**, not here. The engine
source is the sibling repo `../shapeshyft_engine`.

`src/export-surface.test.ts` fails if any name exported before the engine
extraction disappears (baseline: `tests/fixtures/export-surface.json`). To
intentionally remove an export, delete it from that fixture in the same change.
`scripts/list-exports.ts` prints an entry file's export names.

## Layout

```
src/
  index.ts                 # engine re-export + ShapeShyft-only types
  index.test.ts            # type + runtime-helper tests
  export-surface.test.ts   # guards the public export list
scripts/list-exports.ts    # prints an entry file's export names
tests/fixtures/export-surface.json  # export baseline
dist/                      # build output: index.js, index.d.ts (+ .map); ESM only
```

## Commands (verified)

```bash
bun install          # install deps (Bun only)
bun run build        # tsc -p tsconfig.esm.json -> dist/ (ESM + declarations)
bun run clean        # rm -rf dist
bun run dev          # tsc --watch
bun run typecheck    # tsc --noEmit
bun run lint         # eslint src/   (lint:fix to autofix)
bun run format       # prettier --write src/   (format:check to verify)
bun run test:unit    # vitest run    (test:watch for watch mode)
bun run verify       # typecheck -> lint -> build   (does NOT run tests)
```

There is no `bun run test` script — use `test:unit`. There are no
`build:esm` / `build:cjs` scripts.

## Enums (from the engine)

- `LlmProvider`: `openai` | `anthropic` | `gemini` | `mistral` | `cohere` | `groq` | `xai` | `deepseek` | `perplexity` | `lm_studio` | `jev` | `openrouter`
- `HttpMethod`: `GET` | `POST`

## Conventions & Gotchas

- **`LlmApiKeySafe` vs `LlmApiKey`**: always use `LlmApiKeySafe` in API responses.
  `LlmApiKey` carries `encrypted_api_key` / `encryption_iv` that must never reach a client.
- **Re-exports are not duplicated**: `ApiResponse<T>`, `successResponse()`,
  `errorResponse()`, cost helpers, `PROVIDER_MODELS`, etc. come from the engine
  via `export *`. Do not redefine them here.
- **Runtime values exist alongside types**: `successResponse()` / `errorResponse()`
  and the cost/model helpers are real functions re-exported from the engine, not type-only.
- **ESM-only**: `package.json` `exports` has only `import` + `types`. If a
  consumer needs CJS, that is a deliberate change, not the current state.
- **Peer deps**: both `@sudobility/shapeshyft_engine` and `@sudobility/types`
  are peers and must be present at consume time.

## Publishing & Downstream Impact

CI (`.github/workflows/ci-cd.yml`, reusable `johnqh/workflows` with
`publish-target: github`) auto-publishes to **GitHub Packages** on push to
`main`/`develop`. Bump the version in `package.json` as part of the change.
`prepublishOnly` runs `clean` + `verify`.

This is the **base types package** for the ShapeShyft chain, so changes cascade:

```
shapeshyft_engine/types  ->  shapeshyft_types (this)  ->  shapeshyft_client
                                                       ->  shapeshyft_api
                                      client -> shapeshyft_lib -> shapeshyft_app
```

**Be extremely careful with breaking changes.** Renaming/removing a type or
field breaks multiple downstream projects. Prefer additive changes (new optional
fields, new types). After a change: `bun run verify` + `bun run test:unit` here,
publish, then rebuild consumers in dependency order.

## Local Dev Workflow (linking)

```bash
bun link                                          # in this project
cd ../shapeshyft_client && bun link @sudobility/shapeshyft_types
# rebuild here after edits, then rebuild consumers in order
# when done: bun unlink @sudobility/shapeshyft_types && bun install
```

## Workspace Context

Part of the ShapeShyft multi-project workspace in the parent directory. See
`../CLAUDE.md` for the full architecture, dependency graph, and build order.
