/**
 * Demo script showing how to use the compact encoder.
 * Run with: node --loader ts-node/esm src/utils/encodingDemo.ts
 */

import { encodeReactionsCompact, decodeReactionsCompact } from './compactEncoder';
import type { ReactionMap, UniqueMovie } from '../types/session';

// Example movie list (like what you'd get from session data)
const exampleMovies: UniqueMovie[] = [
  {
    id: 'lonesome',
    movie: {
      Movie: 'LONESOME',
      Date: 'Friday, February 6',
      Time: '12:30',
      Tickets: 'https://my.filmforum.org/events/lonesome',
      Datetime: '2026-02-06T12:30:00',
      country: 'U.S.',
      year: '1928',
      director: 'Paul Fejos',
      actors: 'Glenn Tryon, Barbara Kent',
      runtime: '70 minutes',
      description: 'A silent film classic...',
      film_url: 'https://filmforum.org/film/lonesome',
      poster_url: '/posters/lonesome.png',
    },
    showtimes: [],
  },
  {
    id: 'taxi',
    movie: {
      Movie: 'TAXI!',
      Date: 'Friday, February 6',
      Time: '2:10',
      Tickets: 'https://my.filmforum.org/events/taxi',
      Datetime: '2026-02-06T14:10:00',
      country: 'U.S.',
      year: '1932',
      director: 'Roy Del Ruth',
      actors: 'James Cagney, Loretta Young',
      runtime: '69 minutes',
      description: 'A cocky New York cab driver...',
      film_url: 'https://filmforum.org/film/taxi',
      poster_url: '/posters/taxi.png',
    },
    showtimes: [],
  },
  {
    id: 'street-scene',
    movie: {
      Movie: 'STREET SCENE',
      Date: 'Friday, February 6',
      Time: '4:00',
      Tickets: 'https://my.filmforum.org/events/street-scene',
      Datetime: '2026-02-06T16:00:00',
      country: 'U.S.',
      year: '1931',
      director: 'King Vidor',
      actors: 'Sylvia Sidney, William Collier Jr.',
      runtime: '80 minutes',
      description: 'A day in the life of a New York tenement...',
      film_url: 'https://filmforum.org/film/street-scene',
      poster_url: '/posters/street-scene.png',
    },
    showtimes: [],
  },
];

/**
 * Example 1: Basic encoding/decoding
 */
function example1_basic() {
  console.log('\n=== Example 1: Basic Encoding/Decoding ===\n');

  const reactions: ReactionMap = {
    lonesome: 'yes',
    taxi: 'maybe',
    'street-scene': 'no',
  };

  console.log('Original reactions:', reactions);

  const encoded = encodeReactionsCompact(reactions, exampleMovies);
  console.log('Encoded:', encoded);
  console.log('Encoded length:', encoded.length, 'chars');

  const decoded = decodeReactionsCompact(encoded, exampleMovies);
  console.log('Decoded:', decoded);
  console.log('Match:', JSON.stringify(reactions) === JSON.stringify(decoded) ? '✓' : '✗');
}

/**
 * Example 2: Generate shareable URL
 */
function example2_shareableUrl() {
  console.log('\n=== Example 2: Shareable URL ===\n');

  const reactions: ReactionMap = {
    lonesome: 'yes',
    taxi: 'maybe',
  };

  const encoded = encodeReactionsCompact(reactions, exampleMovies);
  const userId = 'alice';
  const sessionId = 'tenement-stories';

  const url = `/session/${sessionId}/list/saved?u=${userId}&r=${encoded}`;
  console.log('Shareable URL:', url);
  console.log('Total length:', url.length, 'chars');
  console.log('\nFull URL:', `https://filmforum.com${url}`);
}

/**
 * Example 3: Sparse reactions (few marked movies)
 */
function example3_sparseReactions() {
  console.log('\n=== Example 3: Sparse Reactions ===\n');

  // Create a large movie list
  const manyMovies: UniqueMovie[] = Array.from({ length: 100 }, (_, i) => ({
    id: `movie-${i}`,
    movie: {
      Movie: `Movie ${i}`,
      Date: '2026-02-07',
      Time: '19:00',
      Tickets: 'https://example.com',
      Datetime: '2026-02-07T19:00:00',
      country: 'U.S.',
      year: '2020',
      director: 'Director',
      actors: 'Actor',
      runtime: '90 minutes',
      description: 'Description',
      film_url: 'https://example.com',
      poster_url: '/poster.png',
    },
    showtimes: [],
  }));

  // Mark only 3 movies out of 100
  const reactions: ReactionMap = {
    'movie-0': 'yes',
    'movie-50': 'maybe',
    'movie-99': 'no',
  };

  const encoded = encodeReactionsCompact(reactions, manyMovies);
  console.log('Movie list size:', manyMovies.length, 'movies');
  console.log('Reactions:', Object.keys(reactions).length, 'marked');
  console.log('Encoded length:', encoded.length, 'chars');
  console.log('Encoded:', encoded);
  console.log('\nThis is extremely compact for sparse data!');
}

/**
 * Example 4: Empty reactions
 */
function example4_emptyReactions() {
  console.log('\n=== Example 4: Empty Reactions ===\n');

  const reactions: ReactionMap = {};

  const encoded = encodeReactionsCompact(reactions, exampleMovies);
  console.log('Encoded empty reactions:', `"${encoded}"`);
  console.log('Length:', encoded.length);

  const decoded = decodeReactionsCompact(encoded, exampleMovies);
  console.log('Decoded:', decoded);
  console.log('Is empty:', Object.keys(decoded).length === 0 ? '✓' : '✗');
}

/**
 * Example 5: Round-trip verification
 */
function example5_roundTrip() {
  console.log('\n=== Example 5: Round-trip Verification ===\n');

  const reactions: ReactionMap = {
    lonesome: 'yes',
    taxi: 'maybe',
    'street-scene': 'no',
  };

  console.log('Original:', reactions);

  // Encode and decode 10 times
  let current = reactions;
  for (let i = 0; i < 10; i++) {
    const encoded = encodeReactionsCompact(current, exampleMovies);
    current = decodeReactionsCompact(encoded, exampleMovies);
  }

  console.log('After 10 round-trips:', current);
  console.log('Still matches:', JSON.stringify(reactions) === JSON.stringify(current) ? '✓' : '✗');
}

/**
 * Example 6: Integration with existing storage
 */
function example6_integration() {
  console.log('\n=== Example 6: Integration Example ===\n');

  // Simulating user marking movies
  const userReactions: ReactionMap = {
    lonesome: 'yes',
    taxi: 'maybe',
  };

  // When user clicks "Share"
  const encoded = encodeReactionsCompact(userReactions, exampleMovies);
  const shareUrl = `/session/tenement-stories/list/saved?u=alice&r=${encoded}`;

  console.log('User marks 2 movies as yes/maybe');
  console.log('Generated share URL:', shareUrl);

  // When friend opens the link (simulating URL param parsing)
  const urlParams = new URLSearchParams(shareUrl.split('?')[1]);
  const friendUserId = urlParams.get('u');
  const encodedReactions = urlParams.get('r');

  console.log('\nFriend opens link:');
  console.log('Friend sees list from:', friendUserId);

  // Decode reactions to show friend
  if (encodedReactions) {
    const friendReactions = decodeReactionsCompact(encodedReactions, exampleMovies);
    console.log('Friend sees these reactions:', friendReactions);

    // Show which movies to display
    const yesMovies = exampleMovies.filter(m => friendReactions[m.id] === 'yes');
    const maybeMovies = exampleMovies.filter(m => friendReactions[m.id] === 'maybe');

    console.log('\nYes movies:', yesMovies.map(m => m.movie.Movie));
    console.log('Maybe movies:', maybeMovies.map(m => m.movie.Movie));
  }
}

// Run all examples
console.log('╔════════════════════════════════════════════╗');
console.log('║  Compact Encoder Demo                     ║');
console.log('╚════════════════════════════════════════════╝');

example1_basic();
example2_shareableUrl();
example3_sparseReactions();
example4_emptyReactions();
example5_roundTrip();
example6_integration();

console.log('\n✓ All examples completed successfully!\n');
