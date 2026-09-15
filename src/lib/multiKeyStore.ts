/**
 * Multi-Key Store — extra API keys per provider, for failover and rotation.
 *
 * Keys live in the shared `app_settings` table (row key `ai_extra_keys`), not in
 * localStorage, so every user and every device sees the same failover pool —
 * matching how the primary keys in `ai_config` already behave.
 *
 * Reads are served from an in-memory cache so the hot path (building the
 * failover chain on every request) stays synchronous.
 */

import { supabase } from '@/integrations/supabase/client';
import type { AIProvider } from './ai-providers';

/** Total keys allowed per provider, primary included. */
export const MAX_KEYS_PER_PROVIDER = 6;
/** Spares on top of the primary. */
export const MAX_EXTRA_KEYS = MAX_KEYS_PER_PROVIDER - 1;

const SETTINGS_KEY = 'ai_extra_keys';
const LEGACY_STORAGE_KEY = 'lawmind_extra_api_keys';

export interface ExtraKey {
  id: string;
  key: string;
  label: string;
  addedAt: string;
}

export type ExtraKeysMap = Record<AIProvider, ExtraKey[]>;

const PROVIDERS: AIProvider[] = ['groq', 'openai', 'gemini', 'openrouter', 'custom'];

function emptyMap(): ExtraKeysMap {
  return { groq: [], openai: [], gemini: [], openrouter: [], custom: [] };
}

/** Fill in any missing providers so callers never hit undefined. */
function normalise(raw: unknown): ExtraKeysMap {
  const out = emptyMap();
  if (!raw || typeof raw !== 'object') return out;
  for (const p of PROVIDERS) {
    const list = (raw as Record<string, unknown>)[p];
    if (Array.isArray(list)) {
      out[p] = list
        .filter((k): k is ExtraKey => !!k && typeof (k as ExtraKey).key === 'string')
        .slice(0, MAX_EXTRA_KEYS);
    }
  }
  return out;
}

// ── In-memory cache (kept current by useAIConfig) ──────────────
let cache: ExtraKeysMap = emptyMap();

export function getCachedKeys(): ExtraKeysMap {
  return cache;
}

export function setCachedKeys(map: ExtraKeysMap): void {
  cache = normalise(map);
}

/** Extra keys for one provider, from cache. Synchronous by design. */
export function getExtraKeys(provider: AIProvider): ExtraKey[] {
  return cache[provider] || [];
}

/**
 * Every key for a provider, primary first then spares, de-duplicated.
 * This is the pool the failover chain rotates through.
 */
export function getAllKeysForProvider(provider: AIProvider, primaryKey: string): string[] {
  const keys = [primaryKey, ...getExtraKeys(provider).map((e) => e.key)].filter(Boolean);
  return [...new Set(keys)].slice(0, MAX_KEYS_PER_PROVIDER);
}

export function getTotalExtraKeys(): number {
  return Object.values(cache).reduce((sum, list) => sum + list.length, 0);
}

// ── Persistence ────────────────────────────────────────────────

/** One-time lift of keys that older builds left in localStorage. */
function readLegacyLocalKeys(): ExtraKeysMap | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = normalise(JSON.parse(raw));
    return Object.values(parsed).some((l) => l.length > 0) ? parsed : null;
  } catch {
    return null;
  }
}

/** Load the shared pool from the database into the cache. */
export async function fetchExtraKeys(): Promise<ExtraKeysMap> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('app_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    console.warn('[multiKeyStore] Could not load extra keys:', error.message);
    return cache;
  }

  let map = normalise(data?.value);

  // Nothing stored yet — adopt anything this browser was holding, once.
  if (!data && Object.values(map).every((l) => l.length === 0)) {
    const legacy = readLegacyLocalKeys();
    if (legacy) {
      map = legacy;
      await persistExtraKeys(map);
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* ignore */ }
      console.info('[multiKeyStore] Migrated browser-local failover keys to the shared database.');
    }
  }

  cache = map;
  return map;
}

/** Write the pool back. Admin-only, enforced by RLS on app_settings. */
export async function persistExtraKeys(map: ExtraKeysMap): Promise<void> {
  const value = normalise(map);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('app_settings')
    .upsert({ key: SETTINGS_KEY, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  cache = value;
}

export class KeyLimitError extends Error {}

/**
 * Add a spare key. Throws KeyLimitError when the provider is full, and
 * refuses duplicates so a pasted-twice key does not eat a slot.
 */
export async function addExtraKey(
  provider: AIProvider,
  key: string,
  label?: string,
): Promise<ExtraKeysMap> {
  const map = { ...cache, [provider]: [...(cache[provider] || [])] };

  if (map[provider].length >= MAX_EXTRA_KEYS) {
    throw new KeyLimitError(
      `${provider} already has the maximum of ${MAX_KEYS_PER_PROVIDER} keys (1 primary + ${MAX_EXTRA_KEYS} spares).`,
    );
  }
  if (map[provider].some((k) => k.key === key)) {
    throw new Error('That key is already in the pool.');
  }

  map[provider].push({
    id: crypto.randomUUID(),
    key,
    label: label || `${provider} key #${map[provider].length + 2}`,
    addedAt: new Date().toISOString(),
  });

  await persistExtraKeys(map);
  return cache;
}

export async function removeExtraKey(provider: AIProvider, id: string): Promise<ExtraKeysMap> {
  const map = {
    ...cache,
    [provider]: (cache[provider] || []).filter((k) => k.id !== id),
  };
  await persistExtraKeys(map);
  return cache;
}
