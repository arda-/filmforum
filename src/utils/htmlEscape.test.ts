/**
 * Test suite for HTML escaping utilities (security-critical).
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeAttr, safeHref } from './htmlEscape';

describe('htmlEscape', () => {
  describe('escapeHtml', () => {
    it('should escape basic HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
      expect(escapeHtml('&amp;')).toBe('&amp;amp;');
    });

    it('should escape less-than signs', () => {
      expect(escapeHtml('<')).toBe('&lt;');
      expect(escapeHtml('a < b')).toBe('a &lt; b');
    });

    it('should escape greater-than signs', () => {
      expect(escapeHtml('>')).toBe('&gt;');
      expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
      expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("'hello'")).toBe('&#039;hello&#039;');
      expect(escapeHtml("it's")).toBe('it&#039;s');
    });

    it('should escape all special characters in combination', () => {
      expect(escapeHtml('<div class="test" data-value=\'foo & bar\'>')).toBe(
        '&lt;div class=&quot;test&quot; data-value=&#039;foo &amp; bar&#039;&gt;'
      );
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should handle strings with no special characters', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
      expect(escapeHtml('123')).toBe('123');
    });

    it('should prevent script injection via closing tags', () => {
      expect(escapeHtml('</script><script>alert("xss")</script>')).toBe(
        '&lt;/script&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should prevent event handler injection', () => {
      expect(escapeHtml('" onload="alert(\'xss\')')).toBe(
        '&quot; onload=&quot;alert(&#039;xss&#039;)'
      );
    });

    it('should prevent HTML entity injection', () => {
      expect(escapeHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;');
    });

    it('should handle Unicode characters safely', () => {
      expect(escapeHtml('Hello 世界')).toBe('Hello 世界');
      expect(escapeHtml('Emoji: 🎬')).toBe('Emoji: 🎬');
    });

    it('should handle very long strings', () => {
      const longString = '<script>' + 'a'.repeat(10000) + '</script>';
      const escaped = escapeHtml(longString);
      expect(escaped.startsWith('&lt;script&gt;')).toBe(true);
      expect(escaped.endsWith('&lt;/script&gt;')).toBe(true);
      expect(escaped.length).toBeGreaterThan(longString.length);
    });

    it('should prevent CSS injection', () => {
      expect(escapeHtml('</style><style>body{display:none}</style>')).toBe(
        '&lt;/style&gt;&lt;style&gt;body{display:none}&lt;/style&gt;'
      );
    });
  });

  describe('escapeAttr', () => {
    it('should escape ampersands', () => {
      expect(escapeAttr('foo & bar')).toBe('foo &amp; bar');
    });

    it('should escape double quotes', () => {
      expect(escapeAttr('value="test"')).toBe('value=&quot;test&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeAttr("value='test'")).toBe('value=&#039;test&#039;');
    });

    it('should NOT escape less-than and greater-than (not needed in attributes)', () => {
      expect(escapeAttr('<>')).toBe('<>');
    });

    it('should handle empty strings', () => {
      expect(escapeAttr('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(escapeAttr(null)).toBe('');
      expect(escapeAttr(undefined)).toBe('');
    });

    it('should handle strings with no special characters', () => {
      expect(escapeAttr('hello')).toBe('hello');
    });

    it('should prevent attribute breakout with quotes', () => {
      expect(escapeAttr('" onload="alert(\'xss\')')).toBe(
        '&quot; onload=&quot;alert(&#039;xss&#039;)'
      );
    });

    it('should handle data attributes safely', () => {
      expect(escapeAttr('{"key":"value"}')).toBe('{&quot;key&quot;:&quot;value&quot;}');
    });

    it('should prevent javascript: injection in data attributes', () => {
      expect(escapeAttr('javascript:alert("xss")')).toBe(
        'javascript:alert(&quot;xss&quot;)'
      );
    });
  });

  describe('safeHref', () => {
    it('should allow http URLs', () => {
      expect(safeHref('http://example.com')).toBe('http://example.com');
      expect(safeHref('http://example.com/path?query=1')).toBe(
        'http://example.com/path?query=1'
      );
    });

    it('should allow https URLs', () => {
      expect(safeHref('https://example.com')).toBe('https://example.com');
      expect(safeHref('https://example.com/path')).toBe('https://example.com/path');
    });

    it('should be case-insensitive for protocol', () => {
      expect(safeHref('HTTP://example.com')).toBe('HTTP://example.com');
      expect(safeHref('HTTPS://example.com')).toBe('HTTPS://example.com');
      expect(safeHref('HtTpS://example.com')).toBe('HtTpS://example.com');
    });

    it('should block javascript: URLs', () => {
      expect(safeHref('javascript:alert("xss")')).toBe('');
      expect(safeHref('JavaScript:alert("xss")')).toBe('');
      expect(safeHref('JAVASCRIPT:alert("xss")')).toBe('');
    });

    it('should block data: URLs', () => {
      expect(safeHref('data:text/html,<script>alert("xss")</script>')).toBe('');
    });

    it('should block vbscript: URLs', () => {
      expect(safeHref('vbscript:msgbox("xss")')).toBe('');
    });

    it('should block file: URLs', () => {
      expect(safeHref('file:///etc/passwd')).toBe('');
    });

    it('should handle empty strings', () => {
      expect(safeHref('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(safeHref(null)).toBe('');
      expect(safeHref(undefined)).toBe('');
    });

    it('should block relative URLs (no protocol)', () => {
      expect(safeHref('/path/to/page')).toBe('');
      expect(safeHref('example.com')).toBe('');
      expect(safeHref('../../../etc/passwd')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(safeHref('  https://example.com  ')).toBe('https://example.com');
      expect(safeHref('\n\thttps://example.com\n\t')).toBe('https://example.com');
    });

    it('should block javascript: with whitespace tricks', () => {
      expect(safeHref(' javascript:alert("xss")')).toBe('');
      expect(safeHref('javascript :alert("xss")')).toBe('');
      expect(safeHref('java\nscript:alert("xss")')).toBe('');
    });

    it('should block URLs with encoded characters', () => {
      // Even though these might decode to dangerous protocols, we only allow http(s)
      expect(safeHref('&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)')).toBe('');
    });

    it('should handle URLs with special characters', () => {
      expect(safeHref('https://example.com/path?q=hello&foo=bar')).toBe(
        'https://example.com/path?q=hello&foo=bar'
      );
      expect(safeHref('https://example.com/path#section')).toBe(
        'https://example.com/path#section'
      );
    });

    it('should handle international domains', () => {
      expect(safeHref('https://例え.jp')).toBe('https://例え.jp');
      expect(safeHref('https://münchen.de')).toBe('https://münchen.de');
    });

    it('should handle URLs with authentication', () => {
      expect(safeHref('https://user:pass@example.com')).toBe('https://user:pass@example.com');
    });

    it('should handle URLs with ports', () => {
      expect(safeHref('https://example.com:8080')).toBe('https://example.com:8080');
      expect(safeHref('http://localhost:3000')).toBe('http://localhost:3000');
    });

    it('should block blob: URLs', () => {
      expect(safeHref('blob:https://example.com/uuid')).toBe('');
    });

    it('should block about: URLs', () => {
      expect(safeHref('about:blank')).toBe('');
    });
  });

  describe('XSS Prevention Integration Tests', () => {
    it('should prevent common XSS attack vectors when used together', () => {
      const userInput = '<img src=x onerror="alert(\'xss\')">';
      const escaped = escapeHtml(userInput);

      // Should not contain any raw HTML tags
      expect(escaped).not.toContain('<img');
      expect(escaped).toContain('&lt;img');
      expect(escaped).toContain('&quot;');
    });

    it('should handle movie descriptions safely', () => {
      const description = 'A film about "love" & <friendship>';
      const escaped = escapeHtml(description);

      expect(escaped).toBe('A film about &quot;love&quot; &amp; &lt;friendship&gt;');
    });

    it('should handle ticket URLs safely', () => {
      const validUrl = 'https://filmforum.org/tickets?movie=123';
      const maliciousUrl = 'javascript:alert(document.cookie)';

      expect(safeHref(validUrl)).toBe(validUrl);
      expect(safeHref(maliciousUrl)).toBe('');
    });

    it('should protect against attribute-based XSS', () => {
      const maliciousAttr = '" onclick="alert(\'xss\')" data-foo="';
      const escaped = escapeAttr(maliciousAttr);

      // Should not contain raw quotes that could break out of the attribute
      expect(escaped).not.toContain('="');
      expect(escaped).toContain('&quot;');
    });

    it('should handle movie titles with special characters', () => {
      const titles = [
        'The "Greatest" Show',
        "It's a Wonderful Life",
        'Love & Other Drugs',
        '<3 Actually',
      ];

      titles.forEach(title => {
        const escaped = escapeHtml(title);
        expect(escaped).not.toContain('<script');
        expect(escaped).not.toContain('onerror=');
      });
    });
  });
});
