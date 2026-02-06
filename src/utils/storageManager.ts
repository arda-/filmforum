import type { MovieReaction, ReactionMap } from '../types/session';

const STORAGE_PREFIX = 'filmforum_reactions_';
const USER_ID_KEY = 'filmforum_user_id';

/**
 * Generate a random user ID (8 chars, URL-safe).
 */
function generateUserId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Get or create a persistent user ID.
 */
export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateUserId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

/**
 * Get all reactions for a session.
 */
export function getReactions(sessionId: string): ReactionMap {
  const raw = localStorage.getItem(STORAGE_PREFIX + sessionId);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Set a single reaction for a movie in a session.
 */
export function setReaction(
  sessionId: string,
  movieId: string,
  reaction: MovieReaction
): ReactionMap {
  const reactions = getReactions(sessionId);
  if (reaction === 'none') {
    delete reactions[movieId];
  } else {
    reactions[movieId] = reaction;
  }
  localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(reactions));
  return reactions;
}

/**
 * Clear all reactions for a session.
 */
export function clearReactions(sessionId: string): void {
  localStorage.removeItem(STORAGE_PREFIX + sessionId);
}

/**
 * Get count of reactions by type.
 */
export function getReactionCounts(sessionId: string): { yes: number; maybe: number; no: number } {
  const reactions = getReactions(sessionId);
  const counts = { yes: 0, maybe: 0, no: 0 };
  for (const r of Object.values(reactions)) {
    if (r === 'yes' || r === 'maybe' || r === 'no') {
      counts[r]++;
    }
  }
  return counts;
}

/**
 * Encode reactions into a compact URL-safe string.
 * Format: movieId1:y,movieId2:m,movieId3:n
 */
export function encodeReactions(reactions: ReactionMap): string {
  const codes: Record<string, string> = { yes: 'y', maybe: 'm', no: 'n' };
  const parts: string[] = [];
  for (const [id, reaction] of Object.entries(reactions)) {
    const code = codes[reaction];
    if (code) {
      parts.push(`${id}:${code}`);
    }
  }
  return btoa(parts.join(','));
}

/**
 * Decode reactions from a URL-safe string.
 */
export function decodeReactions(encoded: string): ReactionMap {
  const codes: Record<string, MovieReaction> = { y: 'yes', m: 'maybe', n: 'no' };
  const reactions: ReactionMap = {};
  try {
    const decoded = atob(encoded);
    for (const part of decoded.split(',')) {
      const [id, code] = part.split(':');
      if (id && code && codes[code]) {
        reactions[id] = codes[code];
      }
    }
  } catch {
    // Invalid encoding, return empty
  }
  return reactions;
}
