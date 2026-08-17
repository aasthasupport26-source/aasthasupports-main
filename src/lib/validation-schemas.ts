import { z } from "zod";

// Image URL validation
export const imageUrlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (err) {
      console.error('Image URL validation failed:', err instanceof Error ? err.message : 'Invalid URL');
      return false;
    }
  },
  { message: "Only HTTP/HTTPS URLs allowed" }
).refine(
  (url) => {
    try {
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(url).pathname);
    } catch (err) {
      console.error('Image file type validation failed:', err instanceof Error ? err.message : 'Invalid URL');
      return false;
    }
  },
  { message: "Invalid image file type" }
);

// Sanitize image URL before rendering
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return "";
    }
    return url;
  } catch {
    return "";
  }
}

// Price validation
export const priceSchema = z.number().positive().max(10000000).finite();

// Duration validation
export const durationSchema = z.number().int().min(1).max(1440);

// Array of strings with limits
export function arrayOfStringsSchema(maxItems: number, maxLength: number) {
  return z.array(z.string().max(maxLength)).max(maxItems);
}
