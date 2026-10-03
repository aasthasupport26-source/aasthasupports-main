// Uses Web Crypto API (globalThis.crypto) which works in both browser and server
// No Node.js 'crypto' module needed.

function getShopId(): string {
  return process.env.SHOPIFY_SHOP_ID || process.env.SHOPIFY_STORE_ID || "";
}
function getClientId(): string {
  return process.env.SHOPIFY_CLIENT_ID || "";
}
function getClientSecret(): string {
  return process.env.SHOPIFY_CLIENT_SECRET || "";
}
function getStoreDomain(): string {
  const val = process.env.SHOPIFY_STORE_DOMAIN;
  if (!val) throw new Error("SHOPIFY_STORE_DOMAIN is required");
  return val;
}
export function getAllowedRedirectUris(): string[] {
  return [
    process.env.VITE_SHOPIFY_REDIRECT_URI,
    "https://aasthasupport.com/auth/callback",
    "https://www.aasthasupport.com/auth/callback",
    "https://aasthasupports.com/auth/callback",
    "https://www.aasthasupports.com/auth/callback",
    "http://localhost:3000/auth/callback",
    "http://localhost:5173/auth/callback",
    "http://localhost:8082/auth/callback",
  ].filter(Boolean) as string[];
}

export function isAllowedRedirectUri(uri: string): boolean {
  const allowed = getAllowedRedirectUris();
  if (allowed.includes(uri)) return true;
  try {
    const parsed = new URL(uri);
    if (parsed.pathname === "/auth/callback") {
      if (
        parsed.hostname.endsWith(".vercel.app") ||
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname.includes("aasthasupport")
      ) {
        return true;
      }
    }
  } catch {}
  return false;
}

export function getOAuthRedirectUri(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return `${origin}/auth/callback`;
    }
    if (origin.includes("aasthasupports.com") || origin.includes("aasthasupport.com")) {
      return `${origin}/auth/callback`;
    }
    if (import.meta.env.VITE_SHOPIFY_REDIRECT_URI) {
      return import.meta.env.VITE_SHOPIFY_REDIRECT_URI;
    }
    return `${origin}/auth/callback`;
  }
  return (
    process.env.VITE_SHOPIFY_REDIRECT_URI ||
    "https://www.aasthasupports.com/auth/callback"
  );
}

export interface OidcConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  issuer: string;
}

export function generateRandomString(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function base64UrlEncode(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function generatePKCE() {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = base64UrlEncode(verifierBytes);
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(hashBuffer));
  return { verifier, challenge };
}

export async function getOidcConfig(): Promise<OidcConfig> {
  const SHOP_ID = getShopId();
  const url = `https://shopify.com/authentication/${SHOP_ID}/.well-known/openid-configuration`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenID configuration from ${url}: ${res.statusText}`);
  }
  return res.json();
}

export async function buildAuthorizeUrl(redirectUri: string) {
  if (!isAllowedRedirectUri(redirectUri)) {
    throw new Error("Invalid redirect URI");
  }

  const oidc = await getOidcConfig();
  const { verifier, challenge } = await generatePKCE();
  const state = generateRandomString(16);
  const nonce = generateRandomString(16);

  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "openid email customer-account-api:full",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const authorizeUrl = `${oidc.authorization_endpoint}?${params.toString()}`;

  return {
    authorizeUrl,
    verifier,
    state,
    nonce,
  };
}

export async function exchangeCodeForTokens(code: string, verifier: string, redirectUri: string) {
  if (!isAllowedRedirectUri(redirectUri)) {
    throw new Error("Invalid redirect URI");
  }

  const CLIENT_SECRET = getClientSecret();
  const oidc = await getOidcConfig();
  const bodyParams: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: getClientId(),
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  };

  if (CLIENT_SECRET) {
    bodyParams.client_secret = CLIENT_SECRET;
  }

  const params = new URLSearchParams(bodyParams);

  const res = await fetch(oidc.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to exchange code for tokens: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function fetchCustomerAccountData(accessToken: string) {
  const SHOP_ID = getShopId();
  const query = `
    query getCustomerInfo {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
        orders(first: 10) {
          nodes {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              nodes {
                title
                quantity
              }
            }
          }
        }
      }
    }
  `;

  const url = `https://shopify.com/${SHOP_ID}/account/customer/api/2025-07/graphql`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: accessToken.startsWith("shcat_") ? accessToken : `shcat_${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shopify Customer Account API error: ${res.status} ${errorText}`);
  }

  return res.json();
}
