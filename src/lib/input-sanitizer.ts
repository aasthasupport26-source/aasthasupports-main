/**
 * Input sanitization and validation utilities
 */

export function sanitizeString(str: string, maxLength: number = 1000): string {
  if (!str) return '';
  return str.replace(/\0/g, '').trim().slice(0, maxLength);
}

export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  return query
    .replace(/[%_]/g, '\\$&')
    .replace(/['";]/g, '')
    .trim()
    .slice(0, 100);
}

export function sanitizeSlug(slug: string): string {
  const noHtml = slug.replace(/<[^>]*>?/gm, '');
  return noHtml
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 100);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, 10000);
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 20);
}

export function validatePhone(phone: string): boolean {
  const cleaned = sanitizePhone(phone).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeNumber(val: any, min?: number, max?: number): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }
  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }
  return num;
}

export function sanitizeHTML(html: string): string {
  if (!html) return '';
  const noTags = html.replace(/<[^>]*>/g, '');
  return noTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 10000);
}
