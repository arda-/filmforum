/**
 * Quick test to verify if current encoding/decoding works
 */

// Simulate the current encoding
function encodeReactions(reactions) {
  const codes = { yes: 'y', maybe: 'm', no: 'n' };
  const parts = [];
  for (const [id, reaction] of Object.entries(reactions)) {
    const code = codes[reaction];
    if (code) {
      parts.push(`${id}:${code}`);
    }
  }
  const joined = parts.join(',');
  console.log('String to encode:', joined);
  return btoa(joined);
}

function decodeReactions(encoded) {
  const codes = { y: 'yes', m: 'maybe', n: 'no' };
  const reactions = {};
  try {
    const decoded = atob(encoded);
    console.log('Decoded string:', decoded);
    for (const part of decoded.split(',')) {
      const [id, code] = part.split(':');
      if (id && code && codes[code]) {
        reactions[id] = codes[code];
      }
    }
  } catch (e) {
    console.error('Decode error:', e);
  }
  return reactions;
}

// Test with example reactions
console.log('=== Testing Current Encoding ===\n');

const testReactions = {
  'lonesome': 'yes',
  'taxi': 'maybe',
  'street-scene': 'no'
};

console.log('Input reactions:', testReactions);
console.log('');

const encoded = encodeReactions(testReactions);
console.log('Encoded:', encoded);
console.log('Length:', encoded.length);
console.log('');

const decoded = decodeReactions(encoded);
console.log('Decoded:', decoded);
console.log('');

// Check if they match
const matches = JSON.stringify(testReactions) === JSON.stringify(decoded);
console.log('Match:', matches ? '✓' : '✗');

if (!matches) {
  console.log('Expected:', testReactions);
  console.log('Got:', decoded);
}

// Test empty encoding
console.log('\n=== Testing Empty ===\n');
const empty = encodeReactions({});
console.log('Empty encoded:', `"${empty}"`);
const emptyDecoded = decodeReactions(empty);
console.log('Empty decoded:', emptyDecoded);
