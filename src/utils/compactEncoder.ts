/**
 * Compact encoding for movie reactions using bitpacked sparse format.
 *
 * Format:
 * - Only encodes non-none reactions
 * - Uses 2 bits per reaction: 01=yes, 10=maybe, 11=no
 * - Variable-length encoding for indices
 *
 * Structure:
 * [count: VarInt]
 * [index1: VarInt][index2: VarInt]...[indexN: VarInt]
 * [reactions: 2 bits each, packed into bytes]
 */

import type { MovieReaction, ReactionMap, UniqueMovie } from '../types/session';

/** Reaction to 2-bit code mapping */
const REACTION_BITS: Record<MovieReaction, number> = {
  'yes': 0b01,
  'maybe': 0b10,
  'no': 0b11,
  'none': 0b00, // Should never be encoded
};

/** 2-bit code to reaction mapping */
const BITS_TO_REACTION: Record<number, MovieReaction> = {
  0b01: 'yes',
  0b10: 'maybe',
  0b11: 'no',
};

/**
 * Encode a variable-length integer (VarInt).
 * Uses 7 bits per byte, with high bit as continuation flag.
 */
function encodeVarInt(n: number): number[] {
  if (n < 0) throw new Error('VarInt must be non-negative');

  const bytes: number[] = [];
  do {
    let byte = n & 0x7F; // Take lower 7 bits
    n >>>= 7; // Shift right 7 bits
    if (n > 0) byte |= 0x80; // Set continuation bit
    bytes.push(byte);
  } while (n > 0);

  return bytes;
}

/**
 * Decode a variable-length integer from byte array.
 * Returns [value, bytesConsumed].
 */
function decodeVarInt(bytes: number[], offset: number): [number, number] {
  let value = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead];
    bytesRead++;

    value |= (byte & 0x7F) << shift;
    shift += 7;

    if ((byte & 0x80) === 0) break; // No continuation bit
  }

  return [value, bytesRead];
}

/**
 * Pack an array of 2-bit values into bytes.
 */
function pack2Bits(values: number[]): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < values.length; i += 4) {
    let byte = 0;
    for (let j = 0; j < 4 && i + j < values.length; j++) {
      byte |= (values[i + j] & 0b11) << (j * 2);
    }
    bytes.push(byte);
  }

  return bytes;
}

/**
 * Unpack 2-bit values from bytes.
 */
function unpack2Bits(bytes: number[], count: number): number[] {
  const values: number[] = [];

  for (let i = 0; i < count; i++) {
    const byteIndex = Math.floor(i / 4);
    const bitOffset = (i % 4) * 2;
    const value = (bytes[byteIndex] >> bitOffset) & 0b11;
    values.push(value);
  }

  return values;
}

/**
 * Convert byte array to base64 string.
 */
function bytesToBase64(bytes: number[]): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

/**
 * Convert base64 string to byte array.
 */
function base64ToBytes(base64: string): number[] {
  const binary = atob(base64);
  return Array.from(binary, c => c.charCodeAt(0));
}

/**
 * Encode reactions using bitpacked sparse format.
 * Only non-none reactions are encoded.
 */
export function encodeReactionsCompact(
  reactions: ReactionMap,
  allMovies: UniqueMovie[]
): string {
  // Collect non-none reactions with their indices
  const entries: Array<{ index: number; reaction: MovieReaction }> = [];

  allMovies.forEach((movie, index) => {
    const reaction = reactions[movie.id];
    if (reaction && reaction !== 'none') {
      entries.push({ index, reaction });
    }
  });

  // Handle empty case
  if (entries.length === 0) {
    return btoa(''); // Empty string
  }

  // Build byte array
  const bytes: number[] = [];

  // 1. Encode count
  bytes.push(...encodeVarInt(entries.length));

  // 2. Encode indices
  for (const entry of entries) {
    bytes.push(...encodeVarInt(entry.index));
  }

  // 3. Pack reactions (2 bits each)
  const reactionBits = entries.map(e => REACTION_BITS[e.reaction]);
  bytes.push(...pack2Bits(reactionBits));

  // Convert to base64
  return bytesToBase64(bytes);
}

/**
 * Decode reactions from bitpacked sparse format.
 */
export function decodeReactionsCompact(
  encoded: string,
  allMovies: UniqueMovie[]
): ReactionMap {
  const reactions: ReactionMap = {};

  if (!encoded) return reactions; // Empty encoding

  try {
    const bytes = base64ToBytes(encoded);
    let offset = 0;

    // 1. Decode count
    const [count, countBytes] = decodeVarInt(bytes, offset);
    offset += countBytes;

    if (count === 0) return reactions;

    // 2. Decode indices
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      const [index, indexBytes] = decodeVarInt(bytes, offset);
      offset += indexBytes;
      indices.push(index);
    }

    // 3. Unpack reactions
    const reactionBytes = bytes.slice(offset);
    const reactionBits = unpack2Bits(reactionBytes, count);

    // 4. Build reaction map
    for (let i = 0; i < count; i++) {
      const movieIndex = indices[i];
      const reactionBit = reactionBits[i];
      const reaction = BITS_TO_REACTION[reactionBit];

      if (allMovies[movieIndex] && reaction) {
        reactions[allMovies[movieIndex].id] = reaction;
      }
    }

    return reactions;
  } catch (error) {
    console.error('Failed to decode reactions:', error);
    return {};
  }
}
