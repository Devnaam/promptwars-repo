import { LRUCache } from 'lru-cache';
import { NextRequest } from 'next/server';

type RateLimitContext = {
  tokenCount: number;
};

// Initialize LRU cache to store request counts.
// Allows up to 500 unique IPs, with entries expiring after 1 minute.
const rateLimit = new LRUCache<string, RateLimitContext>({
  max: 500, // Max 500 unique IPs
  ttl: 60 * 1000, // 1 minute window
});

/**
 * Basic rate-limiting utility to prevent API abuse.
 * Limits each IP address to 5 requests per minute.
 * 
 * @param req NextRequest object to extract the client IP
 * @returns boolean true if the request is allowed, false if rate-limited
 */
export function checkRateLimit(req: NextRequest): boolean {
  // Extract IP, fallback to 'anonymous' if headers aren't present
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  
  const tokenCount = rateLimit.get(ip)?.tokenCount || 0;

  if (tokenCount >= 5) {
    return false; // Rate limit exceeded
  }

  // Increment the request count for this IP
  rateLimit.set(ip, { tokenCount: tokenCount + 1 });
  return true;
}
