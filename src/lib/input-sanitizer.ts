/**
 * Sanitize a slug - removes all HTML tags, converts to lowercase, and replaces spaces with hyphens
 */
export function sanitizeSlug(slug: string): string {
  // Strip HTML tags using regex as a lightweight alternative to DOMPurify
  const noHtml = slug.replace(/<[^>]*>?/gm, '');
  return noHtml.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '');
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch (error) {
    console.error('URL sanitization failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize phone number - remove all non-digit characters
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validate phone number format (10 digits for India)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = sanitizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
