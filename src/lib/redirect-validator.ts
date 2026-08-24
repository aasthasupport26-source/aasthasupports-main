const ALLOWED_DOMAINS = [
  "aasthasupport.com",
  "www.aasthasupport.com",
  "aasthasupports.com",
  "www.aasthasupports.com",
  "localhost",
  "127.0.0.1",
];

export function validateRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (err) {
    console.error('Redirect URL validation failed:', err instanceof Error ? err.message : 'Invalid URL');
    return false;
  }
}

export function sanitizeRedirect(url: string, fallback: string = "/"): string {
  if (!url || url.startsWith("//") || url.includes("://")) {
    if (url && validateRedirectUrl(url)) {
      return url;
    }
    return fallback;
  }
  
  if (url.startsWith("/")) {
    return url;
  }
  
  return fallback;
}
