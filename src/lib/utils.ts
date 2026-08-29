import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with clsx and dedupe conflicting Tailwind classes with twMerge.
 * Standard shadcn-style utility.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a big display number with thin-space thousands separator.
 * Used for archetype readiness scores and counts.
 */
export function formatDisplayNumber(n: number): string {
  return n.toLocaleString('en-US', { useGrouping: true }).replace(/,/g, '\u2009');
}

/**
 * Deterministic pseudo-random from a string seed. Used for token generation.
 */
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Generate a URL-safe token (24 chars) for shareable result URLs.
 */
export function generateToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
