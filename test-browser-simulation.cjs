/**
 * Simulate browser loading the page
 */

const fs = require('fs');

// Load the built HTML
const html = fs.readFileSync('dist/s/tenement-stories/list/saved/index.html', 'utf-8');

// Extract the inline script that sets window.__movieData
const scriptMatch = html.match(/<script>\(function\(\)\{(.*?)\}\)\(\);<\/script>/s);

if (!scriptMatch) {
  console.error('Could not find inline script');
  process.exit(1);
}

const inlineScript = scriptMatch[1];

// Create a fake window object
const window = {
  __movieData: undefined,
  __sessionId: undefined,
};

// Execute the inline script
try {
  eval(`(function(){${inlineScript}})();`);
  console.log('✓ Inline script executed successfully');
  console.log('✓ window.__sessionId:', window.__sessionId);
  console.log('✓ window.__movieData type:', typeof window.__movieData);
  console.log('✓ window.__movieData is array?', Array.isArray(window.__movieData));
  console.log('✓ window.__movieData length:', window.__movieData?.length);

  if (window.__movieData && window.__movieData.length > 0) {
    console.log('✓ First 3 movie IDs:', window.__movieData.slice(0, 3).map(m => m.id));
    console.log('✓ Movie at index 2:', window.__movieData[2]?.id);
    console.log('✓ Movie at index 3:', window.__movieData[3]?.id);
    console.log('✓ Movie at index 5:', window.__movieData[5]?.id);

    // Now simulate the decoder
    const movieUtils = require('./dist/_astro/movieUtils.g7NjbV0W.js');
    // Note: This won't work because it's a browser module, but we can at least check the data loaded
  }
} catch (error) {
  console.error('✗ Error executing inline script:', error.message);
  console.error(error.stack);
}
