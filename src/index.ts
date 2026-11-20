/**
 * @sudobility/shapeshyft_types
 * TypeScript types for ShapeShyft API - LLM structured output platform
 *
 * The product-neutral domain lives in @sudobility/shapeshyft_engine/types and is
 * re-exported here unchanged. This file adds only what is ShapeShyft's own:
 * per-entity LLM API keys and the endpoint binding that points at one.
 */

import type {
  BaseResponse,
  EndpointBase,
  EndpointCreateRequestBase,
  EndpointUpdateRequestBase,
  LlmProvider,
  Optional,
} from '@sudobility/shapeshyft_engine/types';

// `export *` re-exports types as well as values.
export * from '@sudobility/shapeshyft_engine/types';

// =============================================================================
// LLM API Keys (ShapeShyft: provider credentials belong to an entity)
// =============================================================================

/**
 * @description Full LLM API key record including encrypted credentials.
 * Contains sensitive data (encrypted_api_key, encryption_iv) that must never
 * be sent to clients. Use {@link LlmApiKeySafe} for API responses instead.
 */
export interface LlmApiKey {
  /** Unique identifier for this API key record */
  uuid: string;
  /** Entity (organization/personal) that owns this key */
  entity_id: string;
  /** Human-readable label for this key (e.g., "Production OpenAI Key") */
  key_name: string;
  /** LLM provider this key authenticates against */
  provider: LlmProvider;
  /** AES-256-CBC encrypted API key -- null if no key has been set (e.g., local LM Studio) */
  encrypted_api_key: string | null;
  /** Custom endpoint URL for self-hosted or proxy providers (e.g., LM Studio base URL) */
  endpoint_url: string | null;
  /** Initialization vector used for AES decryption of encrypted_api_key */
  encryption_iv: string | null;
  /** Whether this key is enabled for use; null treated as true */
  is_active: boolean | null;
  /** Timestamp when this key record was created */
  created_at: Date | null;
  /** Timestamp of the most recent update to this key */
  updated_at: Date | null;
}

/**
 * @description Safe version of {@link LlmApiKey} without sensitive data.
 * Use this type in all API responses to avoid leaking encrypted credentials.
 * The `has_api_key` boolean indicates whether a key is configured without exposing it.
 */
export interface LlmApiKeySafe {
  /** Unique identifier for this API key record */
  uuid: string;
  /** Entity (organization/personal) that owns this key */
  entity_id: string;
  /** Human-readable label for this key */
  key_name: string;
  /** LLM provider this key authenticates against */
  provider: LlmProvider;
  /** Whether an API key value has been set (true) or is empty (false) */
  has_api_key: boolean;
  /** Custom endpoint URL for self-hosted or proxy providers */
  endpoint_url: string | null;
  /** Whether this key is enabled for use; null treated as true */
  is_active: boolean | null;
  /** Timestamp when this key record was created */
  created_at: Date | null;
  /** Timestamp of the most recent update to this key */
  updated_at: Date | null;
}

// LLM API Key requests
export interface LlmApiKeyCreateRequest {
  key_name: string;
  provider: LlmProvider;
  api_key: Optional<string>;
  endpoint_url: Optional<string>;
}

export interface LlmApiKeyUpdateRequest {
  key_name: Optional<string>;
  api_key: Optional<string>;
  endpoint_url: Optional<string>;
  is_active: Optional<boolean>;
}

// =============================================================================
// Site-wide LLM API Keys (ShapeShyft: platform credentials, not entity-owned)
// =============================================================================

/**
 * @description Full site-wide LLM API key record including encrypted credentials.
 * Site-wide keys are platform-level provider credentials managed by site admins and
 * are NOT owned by any entity. At invocation an active site-wide key for a provider
 * is used as a fallback when an entity has not supplied its own key for that
 * provider. Contains sensitive
 * data (encrypted_api_key, encryption_iv) that must never be sent to clients -- use
 * {@link SiteLlmApiKeySafe} for API responses instead.
 */
export interface SiteLlmApiKey {
  /** Unique identifier for this API key record */
  uuid: string;
  /** Human-readable label for this key (e.g., "Platform OpenAI Key") */
  key_name: string;
  /** LLM provider this key authenticates against */
  provider: LlmProvider;
  /** AES-256-CBC encrypted API key -- null if no key has been set (e.g., local LM Studio) */
  encrypted_api_key: string | null;
  /** Custom endpoint URL for self-hosted or proxy providers (e.g., LM Studio base URL) */
  endpoint_url: string | null;
  /** Initialization vector used for AES decryption of encrypted_api_key */
  encryption_iv: string | null;
  /** Whether this key is enabled for use; null treated as true */
  is_active: boolean | null;
  /** Firebase UID of the site admin who created this key */
  created_by: string | null;
  /** Timestamp when this key record was created */
  created_at: Date | null;
  /** Timestamp of the most recent update to this key */
  updated_at: Date | null;
}

/**
 * @description Safe version of {@link SiteLlmApiKey} without sensitive data.
 * Use this type in all API responses to avoid leaking encrypted credentials.
 * The `has_api_key` boolean indicates whether a key is configured without exposing it.
 */
export interface SiteLlmApiKeySafe {
  /** Unique identifier for this API key record */
  uuid: string;
  /** Human-readable label for this key */
  key_name: string;
  /** LLM provider this key authenticates against */
  provider: LlmProvider;
  /** Whether an API key value has been set (true) or is empty (false) */
  has_api_key: boolean;
  /** Custom endpoint URL for self-hosted or proxy providers */
  endpoint_url: string | null;
  /** Whether this key is enabled for use; null treated as true */
  is_active: boolean | null;
  /** Firebase UID of the site admin who created this key */
  created_by: string | null;
  /** Timestamp when this key record was created */
  created_at: Date | null;
  /** Timestamp of the most recent update to this key */
  updated_at: Date | null;
}

// Site-wide LLM API Key requests
export interface SiteLlmApiKeyCreateRequest {
  key_name: string;
  provider: LlmProvider;
  api_key: Optional<string>;
  endpoint_url: Optional<string>;
}

export interface SiteLlmApiKeyUpdateRequest {
  key_name: Optional<string>;
  api_key: Optional<string>;
  endpoint_url: Optional<string>;
  is_active: Optional<boolean>;
}

// =============================================================================
// Provider IP Sync Types
// =============================================================================

/** A provider whose URL was moved to the caller's address. */
export interface ProviderIpSyncUpdated {
  uuid: string;
  key_name: string;
  /** The URL before the sync */
  from: string;
  /** The URL now stored */
  to: string;
}

/** A provider already pointing at the caller's address. */
export interface ProviderIpSyncUnchanged {
  uuid: string;
  key_name: string;
  url: string;
}

/** A provider left alone, with the reason why. */
export interface ProviderIpSyncSkipped {
  uuid: string;
  key_name: string;
  url: string | null;
  /** Why this provider was not rewritten, e.g. its host is a DNS name */
  reason: string;
}

/**
 * What the API sees about where a request came from.
 *
 * Read-only diagnostic for working out which header actually carries the client
 * address in a given deployment, before trusting one. Only forwarding-related
 * headers are echoed -- never the credential the request was authenticated with.
 */
export interface ClientIpDiagnostics {
  /** The TCP peer exactly as the server reported it, before normalization */
  peer_raw: string | null;
  /** The peer as an IP literal, with any IPv4-mapped IPv6 wrapper removed */
  peer: string | null;
  /** True when the peer is a public address, meaning the client reached us directly */
  peer_is_public: boolean;
  /** The address the sync would use, or null if it could not be established */
  resolved_ip: string | null;
  /** Allowlisted forwarding headers present on the request */
  forwarding_headers: Record<string, string>;
}

/**
 * Result of pointing an entity's self-hosted providers at the caller's IP.
 *
 * Every `lm_studio` provider owned by the entity lands in exactly one bucket,
 * so a cron job on the home machine can log what actually moved.
 */
export interface ProviderIpSyncResponse {
  /** The address the request arrived from, as written into the URLs */
  client_ip: string;
  updated: ProviderIpSyncUpdated[];
  unchanged: ProviderIpSyncUnchanged[];
  skipped: ProviderIpSyncSkipped[];
}

// LLM API key response aliases
export type LlmApiKeyListResponse = BaseResponse<LlmApiKeySafe[]>;
export type LlmApiKeyResponse = BaseResponse<LlmApiKeySafe>;

// Site-wide LLM API key response aliases
export type SiteLlmApiKeyListResponse = BaseResponse<SiteLlmApiKeySafe[]>;
export type SiteLlmApiKeyResponse = BaseResponse<SiteLlmApiKeySafe>;

// =============================================================================
// Endpoint binding (ShapeShyft: an endpoint points at one LlmApiKey)
// =============================================================================

/**
 * @description A ShapeShyft endpoint: the shared endpoint fields plus the LLM API
 * key it calls through.
 */
export interface Endpoint extends EndpointBase {
  /** UUID of the {@link LlmApiKey} used to authenticate LLM requests */
  llm_key_id: string;
  /**
   * Provider of that key, copied onto the endpoint. `null` only for a row
   * created by a pre-extraction server during a rolling deploy, before the next
   * boot's backfill.
   */
  provider: LlmProvider | null;
}

export interface EndpointCreateRequest extends EndpointCreateRequestBase {
  llm_key_id: string;
}

export interface EndpointUpdateRequest extends EndpointUpdateRequestBase {
  llm_key_id?: Optional<string>;
}

export type EndpointListResponse = BaseResponse<Endpoint[]>;
export type EndpointResponse = BaseResponse<Endpoint>;
