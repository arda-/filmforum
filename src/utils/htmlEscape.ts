/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Used when interpolating user-provided or untrusted strings into innerHTML.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str == null) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes an HTML attribute value.
 * Use this for data-* attributes and other attribute values.
 *
 * @param str - The attribute value to escape
 * @returns The escaped attribute value
 */
export function escapeAttr(str: string | null | undefined): string {
  if (str == null) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Returns the URL only if it uses a safe protocol (http/https).
 * Prevents javascript: and other dangerous URI schemes in href attributes.
 *
 * @param url - The URL to validate
 * @returns The URL if safe, empty string otherwise
 */
/**
 * Safely serializes data as JSON for embedding inside a `<script>` tag.
 * Escapes `<` as `\u003c` to prevent `</script>` from breaking out of the tag.
 * OWASP-recommended pattern for inline JSON.
 *
 * @param data - The data to serialize
 * @returns JSON string safe for use with set:html in script tags
 */
export function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function safeHref(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}
