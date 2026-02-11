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
export function safeHref(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}
