/**
 * Test decoding the actual URL the user provided
 */

// Decode base64
const encoded = 'AwIDBSU=';
const decoded = Buffer.from(encoded, 'base64');

console.log('Encoded:', encoded);
console.log('Decoded bytes:', Array.from(decoded).map(b => '0x' + b.toString(16).padStart(2, '0')));
console.log('Decoded bytes (decimal):', Array.from(decoded));

// Manual decode according to compact encoder format
const bytes = Array.from(decoded);
let offset = 0;

// Read count (VarInt)
function readVarInt() {
  let value = 0;
  let shift = 0;
  while (offset < bytes.length) {
    const byte = bytes[offset++];
    value |= (byte & 0x7F) << shift;
    shift += 7;
    if ((byte & 0x80) === 0) break;
  }
  return value;
}

const count = readVarInt();
console.log('\nCount:', count);

// Read indices
const indices = [];
for (let i = 0; i < count; i++) {
  const index = readVarInt();
  indices.push(index);
}
console.log('Indices:', indices);

// Read reactions (2 bits each, packed)
const reactions = [];
const reactionBytes = bytes.slice(offset);
console.log('Reaction bytes:', reactionBytes.map(b => '0x' + b.toString(16).padStart(2, '0')));

for (let i = 0; i < count; i++) {
  const byteIndex = Math.floor(i / 4);
  const bitOffset = (i % 4) * 2;
  const value = (reactionBytes[byteIndex] >> bitOffset) & 0b11;
  reactions.push(value);
}

const reactionNames = { 1: 'yes', 2: 'maybe', 3: 'no' };
console.log('Reactions (raw):', reactions);
console.log('Reactions (decoded):', reactions.map(r => reactionNames[r] || 'unknown'));

console.log('\nFinal result:');
indices.forEach((idx, i) => {
  console.log(`  Movie at index ${idx}: ${reactionNames[reactions[i]] || 'unknown'}`);
});
