/**
 * Simulate the exact share flow to find the bug
 */

const fs = require('fs');
const path = require('path');

// Load the actual movie data
const movieData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/tenement-stories-full.json'), 'utf-8'));

// Simulate movieId function
function movieId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Simulate deduplication
function deduplicateMovies(movies) {
  const map = new Map();

  for (const m of movies) {
    const id = movieId(m.Movie);
    const existing = map.get(id);

    if (existing) {
      existing.showtimes.push({
        datetime: m.Datetime,
        time: m.Time,
        tickets: m.Tickets,
      });
    } else {
      map.set(id, {
        id,
        movie: m,
        showtimes: [{
          datetime: m.Datetime,
          time: m.Time,
          tickets: m.Tickets,
        }],
      });
    }
  }

  return Array.from(map.values());
}

// Simulate sort
function sortKey(title) {
  return title.replace(/^(a|an|the)\s+/i, '');
}

function sortMovies(movies) {
  return [...movies].sort((a, b) =>
    sortKey(a.movie.Movie).localeCompare(sortKey(b.movie.Movie))
  );
}

// Process movies like the page does
const uniqueMovies = sortMovies(deduplicateMovies(movieData));

console.log('Total movies:', uniqueMovies.length);
console.log('First 10 movie IDs:');
uniqueMovies.slice(0, 10).forEach((m, i) => {
  console.log(`  ${i}: ${m.id} (${m.movie.Movie})`);
});

// Test the encoding from URL: AwIDBSU=
// This should decode to:
// - Movie at index 2: yes
// - Movie at index 3: yes
// - Movie at index 5: maybe

console.log('\\nExpected movies based on encoding AwIDBSU=:');
console.log('  Index 2:', uniqueMovies[2]?.id, '-', uniqueMovies[2]?.movie.Movie);
console.log('  Index 3:', uniqueMovies[3]?.id, '-', uniqueMovies[3]?.movie.Movie);
console.log('  Index 5:', uniqueMovies[5]?.id, '-', uniqueMovies[5]?.movie.Movie);

// Now simulate the compact decoder
const REACTION_BITS = {
  'yes': 0b01,
  'maybe': 0b10,
  'no': 0b11,
  'none': 0b00,
};

const BITS_TO_REACTION = {
  0b01: 'yes',
  0b10: 'maybe',
  0b11: 'no',
};

function decodeReactionsCompact(encoded, allMovies) {
  const reactions = {};
  if (!encoded) return reactions;

  try {
    // Base64 decode
    const decoded = Buffer.from(encoded, 'base64');
    const bytes = Array.from(decoded);
    let offset = 0;

    // Decode count
    function decodeVarInt() {
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

    const count = decodeVarInt();
    console.log('\\nDecoding process:');
    console.log('  Count:', count);

    if (count === 0) return reactions;

    // Decode indices
    const indices = [];
    for (let i = 0; i < count; i++) {
      indices.push(decodeVarInt());
    }
    console.log('  Indices:', indices);

    // Decode reactions
    const reactionBytes = bytes.slice(offset);
    const reactionBits = [];
    for (let i = 0; i < count; i++) {
      const byteIndex = Math.floor(i / 4);
      const bitOffset = (i % 4) * 2;
      const value = (reactionBytes[byteIndex] >> bitOffset) & 0b11;
      reactionBits.push(value);
    }
    console.log('  Reaction bits:', reactionBits);

    // Build reaction map
    for (let i = 0; i < count; i++) {
      const movieIndex = indices[i];
      const reactionBit = reactionBits[i];
      const reaction = BITS_TO_REACTION[reactionBit];

      if (allMovies[movieIndex] && reaction) {
        reactions[allMovies[movieIndex].id] = reaction;
        console.log(`  Mapped: allMovies[${movieIndex}].id="${allMovies[movieIndex].id}" → ${reaction}`);
      }
    }

    return reactions;
  } catch (error) {
    console.error('Decode error:', error);
    return {};
  }
}

// Test with the actual URL encoding
const encoded = 'AwIDBSU=';
const decoded = decodeReactionsCompact(encoded, uniqueMovies);

console.log('\\nFinal decoded reactions:');
console.log(decoded);

console.log('\\nFiltered results:');
const yesMovies = uniqueMovies.filter(m => decoded[m.id] === 'yes');
const maybeMovies = uniqueMovies.filter(m => decoded[m.id] === 'maybe');

console.log('Yes movies:', yesMovies.map(m => ({ id: m.id, title: m.movie.Movie })));
console.log('Maybe movies:', maybeMovies.map(m => ({ id: m.id, title: m.movie.Movie })));

if (yesMovies.length === 0 && maybeMovies.length === 0) {
  console.log('\\n❌ BUG CONFIRMED: No movies found!');
} else {
  console.log('\\n✓ Working correctly');
}
