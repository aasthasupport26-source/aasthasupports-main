import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  createShopifyCustomer,
  loginShopifyCustomer,
  getShopifyCustomer,
  logoutShopifyCustomer,
  syncShopifyCustomerToSupabase,
  supabaseAdmin,
} from "./auth/shopify-customer";
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  fetchCustomerAccountData,
} from "./shopify-oauth";
import { signAdminToken, verifyAdminToken, isAdminToken } from "./admin-guard";
import { checkRateLimit } from "./rate-limit";

// Schema for registration
const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
});

// Schema for login
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Schema for verifying access token
const VerifyTokenSchema = z.object({
  accessToken: z.string(),
});

/**
 * Register a new user
 * Creates Shopify customer account and syncs to Supabase
 */
export const registerUser = createServerFn({ method: "POST" })
  .validator(RegisterSchema)
  .handler(async ({ data, request }) => {
    await validateCSRF(request);
    
    const rateCheck = checkRateLimit(request, "auth");
    if (!rateCheck.allowed) {
      throw new Error(`Too many registration attempts. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    try {
      // Create Shopify customer
      const customer = await createShopifyCustomer({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      // Sync to Supabase
      await syncShopifyCustomerToSupabase(customer);

      // Auto-login after registration
      const { accessToken } = await loginShopifyCustomer(data.email, data.password);

      return {
        success: true,
        customer,
        accessToken: accessToken.accessToken,
        expiresAt: accessToken.expiresAt,
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to create account");
    }
  });

/**
 * Login user
 * Authenticates with Shopify and returns access token
 */
export const loginUser = createServerFn({ method: "POST" })
  .validator(LoginSchema)
  .handler(async ({ data, request }) => {
    await validateCSRF(request);
    
    const rateCheck = checkRateLimit(request, "auth");
    if (!rateCheck.allowed) {
      throw new Error(`Too many login attempts. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const rateCheck = checkRateLimit(request, "auth");
    if (!rateCheck.allowed) {
      logSecurityEvent({
        type: "rate_limit",
        severity: "medium",
        ip: clientIp,
        endpoint: "/api/auth/login",
        details: { email: data.email },
      });
      throw new Error(`Too many login attempts. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    try {
      const { data: adminUser } = await supabaseAdmin
        .from("users")
        .select("email, full_name, is_admin, password_hash")
        .eq("email", data.email)
        .eq("is_admin", true)
        .single();

      if (adminUser) {
        const storedHash = (adminUser as any)?.password_hash;
        if (!storedHash) {
          throw new Error("Admin login disabled: missing stored password hash");
        }
        
        const ok = await bcrypt.compare(data.password, storedHash);
        if (!ok) {
          recordFailedAttempt(identifier);
          logSecurityEvent({
            type: "auth_failure",
            severity: "medium",
            ip: clientIp,
            endpoint: "/api/auth/login",
            details: { email: data.email, reason: "invalid_password" },
          });
          throw new Error("Invalid email or password");
        }
        
        // Successful login - reset attempts
        resetAttempts(identifier);

        const { token, expiresAt } = signAdminToken(adminUser.email);

        return {
          success: true,
          customer: {
            id: "admin-" + adminUser.email,
            email: adminUser.email,
            firstName: adminUser.full_name?.split(" ")[0] || "Admin",
            lastName: adminUser.full_name?.split(" ")[1] || "",
            phone: null,
            displayName: adminUser.full_name || "Admin",
          },
          accessToken: token,
          expiresAt,
        };
      }

      const { customer, accessToken } = await loginShopifyCustomer(data.email, data.password);

      await syncShopifyCustomerToSupabase(customer);

      return {
        success: true,
        customer,
        accessToken: accessToken.accessToken,
        expiresAt: accessToken.expiresAt,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Invalid email or password");
    }
  });

/**
 * Verify access token and get customer details
 * Used to restore session on page load
 */
export const verifyAccessToken = createServerFn({ method: "POST" })
  .validator(VerifyTokenSchema)
  .handler(async ({ data }) => {
    try {
      // Check if this is an admin JWT token
      if (isAdminToken(data.accessToken)) {
        const payload = verifyAdminToken(data.accessToken);

        // Fetch the admin user by the email embedded in the JWT
        const { data: adminUser } = await supabaseAdmin
          .from("users")
          .select("email, full_name, is_admin")
          .eq("email", payload.email)
          .eq("is_admin", true)
          .single();

        if (adminUser) {
          return {
            success: true,
            customer: {
              id: "admin-" + adminUser.email,
              email: adminUser.email,
              firstName: adminUser.full_name?.split(" ")[0] || "Admin",
              lastName: adminUser.full_name?.split(" ")[1] || "",
              phone: null,
              displayName: adminUser.full_name || "Admin",
            },
          };
        }
        throw new Error("Admin user not found");
      }

      // Regular Shopify token
      const customer = await getShopifyCustomer(data.accessToken);

      // Sync to Supabase
      await syncShopifyCustomerToSupabase(customer);

      return {
        success: true,
        customer,
      };
    } catch (error: any) {
      console.error("Token verification error:", error);
      throw new Error("Session expired. Please login again.");
    }
  });

/**
 * Logout user
 * Invalidates Shopify access token
 */
export const logoutUser = createServerFn({ method: "POST" })
  .validator(VerifyTokenSchema)
  .handler(async ({ data }) => {
    try {
      await logoutShopifyCustomer(data.accessToken);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      // Don't throw error on logout failure - just clear client-side
      return {
        success: true,
      };
    }
  });

/**
 * Get user details from Supabase by email
 * Used for booking lookups
 */
export const getUserByEmail = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single();

    if (error || !user) {
      throw new Error("User not found");
    }

    return user;
  });

/**
 * Initiate Shopify Customer Account API OAuth flow
 * Returns authorizeUrl and PKCE verifier to client/session
 */
export const getShopifyOAuthUrl = createServerFn({ method: "POST" })
  .validator(z.object({ redirectUri: z.string().url() }))
  .handler(async ({ data }) => {
    try {
      const authData = await buildAuthorizeUrl(data.redirectUri);

      const isProd = process.env.NODE_ENV === "production";

      // Combine into a single cookie to avoid Vercel multiple Set-Cookie header overwrite bug
      const oauthSession = JSON.stringify({ 
        verifier: authData.verifier, 
        state: authData.state,
        nonce: authData.nonce 
      });

      setCookie("shopify_oauth_session", oauthSession, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 600, // 10 minutes
        path: "/",
      });

      return {
        success: true,
        authorizeUrl: authData.authorizeUrl,
      };
    } catch (error: any) {
      console.error("Error generating Shopify OAuth URL:", error);
      throw new Error(error.message || "Failed to initialize Shopify OAuth");
    }
  });

/**
 * Exchange authorization code for Customer Account API access token
 */
export const exchangeOAuthCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string(),
      state: z.string(),
      redirectUri: z.string().url(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const sessionStr = getCookie("shopify_oauth_session");
      let verifier = "";
      let savedState = "";
      let savedNonce = "";

      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          verifier = session.verifier;
          savedState = session.state;
          savedNonce = session.nonce;
        } catch (e) {
          console.error("Failed to parse oauth session cookie");
        }
      }

      // Sensitive auth data — do not log in production

      if (!verifier) {
        throw new Error("PKCE verifier missing from server session cookies.");
      }

      if (!savedState || !data.state || savedState !== data.state) {
        throw new Error("State mismatch detected. Authentication aborted.");
      }

      // Delete cookie after use (single use)
      deleteCookie("shopify_oauth_session");

      const tokens = await exchangeCodeForTokens(data.code, verifier, data.redirectUri);
      
      // Validate nonce from ID token
      if (savedNonce && tokens.id_token) {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.decode(tokens.id_token) as any;
        if (!decoded || decoded.nonce !== savedNonce) {
          throw new Error("Nonce mismatch detected. Authentication aborted.");
        }
      }
      
      const customerData = await fetchCustomerAccountData(tokens.access_token);

      const customerNode = customerData.data?.customer;
      const email = customerNode?.emailAddress?.emailAddress;
      const firstName = customerNode?.firstName || "";
      const lastName = customerNode?.lastName || "";
      const phone = customerNode?.phoneNumber?.phoneNumber || null;

      const customer = {
        id: customerNode?.id || "shopify-customer",
        email: email || "",
        firstName,
        lastName,
        phone,
        displayName: `${firstName} ${lastName}`.trim() || email || "Customer",
      };

      // Sync customer to Supabase DB if email present
      if (email) {
        await syncShopifyCustomerToSupabase(customer);
      }

      return {
        success: true,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        customer,
        orders: customerNode?.orders?.nodes || [],
      };
    } catch (error: any) {
      console.error("OAuth code exchange error:", error);
      throw new Error(error.message || "Failed to complete OAuth authentication");
    }
  });
