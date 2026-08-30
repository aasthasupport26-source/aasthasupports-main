import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// All env vars are read lazily inside getters so the module can be safely
// imported on the client without throwing. The actual values are only needed
// on the server (inside createServerFn handlers).

function getSupabaseUrl(): string {
  const val = process.env.SUPABASE_URL;
  if (!val) throw new Error("SUPABASE_URL is required");
  return val;
}
function getSupabaseServiceKey(): string {
  const val = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!val) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  return val;
}
function getSupabaseAnonKey(): string {
  const val = process.env.SUPABASE_ANON_KEY;
  if (!val) throw new Error("SUPABASE_ANON_KEY is required");
  return val;
}
function getShopifyStoreDomain(): string {
  const val = process.env.SHOPIFY_STORE_DOMAIN;
  if (!val) throw new Error("SHOPIFY_STORE_DOMAIN is required");
  return val;
}
function getShopifyStorefrontToken(): string {
  const val = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!val) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is required");
  return val;
}

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;
let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient<Database>(getSupabaseUrl(), getSupabaseServiceKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return Reflect.get(_supabaseAdmin, prop);
  }
});

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return Reflect.get(_supabase, prop);
  }
});

interface ShopifyCustomerCreateInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  displayName: string;
  emailMarketingConsent?: {
    marketingState: string;
  };
}

/**
 * Create a Shopify customer account
 */
export async function createShopifyCustomer(
  input: ShopifyCustomerCreateInput,
): Promise<ShopifyCustomer> {
  const SHOPIFY_STORE_DOMAIN = getShopifyStoreDomain();
  const SHOPIFY_STOREFRONT_TOKEN = getShopifyStorefrontToken();

  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
          displayName
          emailMarketingConsent {
            marketingState
          }
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          email: input.email,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          acceptsMarketing: input.acceptsMarketing || false,
        },
      },
    }),
  });

  const json = await response.json();

  if (json.data?.customerCreate?.customerUserErrors?.length > 0) {
    const error = json.data.customerCreate.customerUserErrors[0];
    throw new Error(error.message || "Failed to create account");
  }

  const customer = json.data.customerCreate.customer;

  if (process.env.NODE_ENV !== "production") {
    console.info("Customer created - verification email sent to:", customer.email);
  }

  return customer;
}

/**
 * Login a Shopify customer and get access token
 */
export async function loginShopifyCustomer(
  email: string,
  password: string,
): Promise<{ customer: ShopifyCustomer; accessToken: ShopifyCustomerAccessToken }> {
  const SHOPIFY_STORE_DOMAIN = getShopifyStoreDomain();
  const SHOPIFY_STOREFRONT_TOKEN = getShopifyStorefrontToken();

  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          email,
          password,
        },
      },
    }),
  });

  const json = await response.json();

  if (json.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
    const error = json.data.customerAccessTokenCreate.customerUserErrors[0];
    throw new Error(error.message || "Invalid email or password");
  }

  const accessToken = json.data.customerAccessTokenCreate.customerAccessToken;
  const customer = await getShopifyCustomer(accessToken.accessToken);

  return { customer, accessToken };
}

/**
 * Get customer details using access token
 */
export async function getShopifyCustomer(accessToken: string): Promise<ShopifyCustomer> {
  if (accessToken.startsWith("shcat_")) {
    const SHOP_ID = process.env.SHOPIFY_SHOP_ID || process.env.SHOPIFY_STORE_ID;
    const url = `https://shopify.com/${SHOP_ID}/account/customer/api/2025-07/graphql`;
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
        }
      }
    `;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken.startsWith("shcat_") ? accessToken : `shcat_${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Shopify Customer Account API error: ${res.status} ${errorText}`);
    }

    const json = await res.json();
    const customerNode = json.data?.customer;
    if (!customerNode) {
      throw new Error("Customer not found or token expired");
    }

    return {
      id: customerNode.id || "shopify-customer",
      email: customerNode.emailAddress?.emailAddress || "",
      firstName: customerNode.firstName || null,
      lastName: customerNode.lastName || null,
      phone: customerNode.phoneNumber?.phoneNumber || null,
      displayName:
        `${customerNode.firstName || ""} ${customerNode.lastName || ""}`.trim() ||
        customerNode.emailAddress?.emailAddress ||
        "Customer",
    };
  }

  const SHOPIFY_STORE_DOMAIN = getShopifyStoreDomain();
  const SHOPIFY_STOREFRONT_TOKEN = getShopifyStorefrontToken();

  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        firstName
        lastName
        phone
        displayName
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: {
        customerAccessToken: accessToken,
      },
    }),
  });

  const json = await response.json();

  if (!json.data?.customer) {
    throw new Error("Customer not found or token expired");
  }

  return json.data.customer;
}

/**
 * Logout customer (delete access token)
 */
export async function logoutShopifyCustomer(accessToken: string): Promise<void> {
  const SHOPIFY_STORE_DOMAIN = getShopifyStoreDomain();
  const SHOPIFY_STOREFRONT_TOKEN = getShopifyStorefrontToken();

  const mutation = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          field
          message
        }
      }
    }
  `;

  await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        customerAccessToken: accessToken,
      },
    }),
  });
}

/**
 * Sync Shopify customer to our Supabase users table
 */
export async function syncShopifyCustomerToSupabase(customer: ShopifyCustomer): Promise<void> {
  const { error } = await supabaseAdmin.from("users").upsert(
    {
      email: customer.email,
      full_name:
        customer.displayName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
      phone: customer.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "email",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    console.error("Failed to sync customer to Supabase:", error);
    throw new Error("Failed to sync user data");
  }
}

/**
 * Verify an access token and return customer info
 */
export async function verifyAccessToken(accessToken: string): Promise<ShopifyCustomer | null> {
  try {
    return await getShopifyCustomer(accessToken);
  } catch {
    return null;
  }
}

/**
 * Get user with admin status
 */
export async function getUserWithAdminStatus(email: string): Promise<{ is_admin: boolean } | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Failed to get user admin status:", error);
    return null;
  }

  return data;
}
