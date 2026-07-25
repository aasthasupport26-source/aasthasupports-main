import crypto from 'node:crypto';

const SHOP_ID = process.env.SHOPIFY_SHOP_ID || process.env.SHOPIFY_STORE_ID;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

export interface OidcConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  issuer: string;
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function base64UrlEncode(str: Buffer): string {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function generatePKCE() {
  const verifier = base64UrlEncode(crypto.randomBytes(32));
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = base64UrlEncode(hash);
  return { verifier, challenge };
}

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '08axwa-1x.myshopify.com';

export async function getOidcConfig(): Promise<OidcConfig> {
  const url = `https://shopify.com/authentication/${SHOP_ID}/.well-known/openid-configuration`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenID configuration from ${url}: ${res.statusText}`);
  }
  return res.json();
}

export async function buildAuthorizeUrl(redirectUri: string) {
  const oidc = await getOidcConfig();
  const { verifier, challenge } = generatePKCE();
  const state = generateRandomString(16);
  const nonce = generateRandomString(16);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'openid email profile customer-account-api:full',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
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
  const oidc = await getOidcConfig();
  const bodyParams: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID!,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  };

  if (CLIENT_SECRET) {
    bodyParams.client_secret = CLIENT_SECRET;
  }

  const params = new URLSearchParams(bodyParams);

  const res = await fetch(oidc.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
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

  const url = `https://shopify.com/${SHOP_ID}/account/customer/api/2024-07/graphql`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shopify Customer Account API error: ${res.status} ${errorText}`);
  }

  return res.json();
}
