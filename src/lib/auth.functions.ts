import { createServerFn } from '@tanstack/react-start';
import { setCookie, getCookie, deleteCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import {
  createShopifyCustomer,
  loginShopifyCustomer,
  getShopifyCustomer,
  logoutShopifyCustomer,
  syncShopifyCustomerToSupabase,
  supabaseAdmin,
} from './auth/shopify-customer';
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  fetchCustomerAccountData,
} from './shopify-oauth';

// Schema for registration
const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
});

// Schema for login
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for verifying access token
const VerifyTokenSchema = z.object({
  accessToken: z.string(),
});

/**
 * Register a new user
 * Creates Shopify customer account and syncs to Supabase
 */
export const registerUser = createServerFn({ method: 'POST' })
  .validator(RegisterSchema)
  .handler(async ({ data }) => {
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
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  });

/**
 * Login user
 * Authenticates with Shopify and returns access token
 */
export const loginUser = createServerFn({ method: 'POST' })
  .validator(LoginSchema)
  .handler(async ({ data }) => {
    try {
      // First check if this is an admin user in Supabase
      const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('email, full_name, is_admin')
        .eq('email', data.email)
        .eq('is_admin', true)
        .single();

      // If admin user exists, bypass Shopify and login directly
      if (adminUser) {
        return {
          success: true,
          customer: {
            id: 'admin-' + adminUser.email,
            email: adminUser.email,
            firstName: adminUser.full_name?.split(' ')[0] || 'Admin',
            lastName: adminUser.full_name?.split(' ')[1] || '',
            phone: null,
            displayName: adminUser.full_name || 'Admin',
          },
          accessToken: 'admin-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      }

      // Regular user - authenticate with Shopify
      const { customer, accessToken } = await loginShopifyCustomer(data.email, data.password);

      // Sync to Supabase (in case customer details changed)
      await syncShopifyCustomerToSupabase(customer);

      return {
        success: true,
        customer,
        accessToken: accessToken.accessToken,
        expiresAt: accessToken.expiresAt,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  });

/**
 * Verify access token and get customer details
 * Used to restore session on page load
 */
export const verifyAccessToken = createServerFn({ method: 'POST' })
  .validator(VerifyTokenSchema)
  .handler(async ({ data }) => {
    try {
      // Check if this is an admin token
      if (data.accessToken.startsWith('admin-token-')) {
        // Extract email from token or get from Supabase
        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('email, full_name, is_admin')
          .eq('is_admin', true)
          .limit(1);

        if (admins && admins.length > 0) {
          const adminUser = admins[0];
          return {
            success: true,
            customer: {
              id: 'admin-' + adminUser.email,
              email: adminUser.email,
              firstName: adminUser.full_name?.split(' ')[0] || 'Admin',
              lastName: adminUser.full_name?.split(' ')[1] || '',
              phone: null,
              displayName: adminUser.full_name || 'Admin',
            },
          };
        }
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
      console.error('Token verification error:', error);
      throw new Error('Session expired. Please login again.');
    }
  });

/**
 * Logout user
 * Invalidates Shopify access token
 */
export const logoutUser = createServerFn({ method: 'POST' })
  .validator(VerifyTokenSchema)
  .handler(async ({ data }) => {
    try {
      await logoutShopifyCustomer(data.accessToken);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Logout error:', error);
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
export const getUserByEmail = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    return user;
  });

/**
 * Initiate Shopify Customer Account API OAuth flow
 * Returns authorizeUrl and PKCE verifier to client/session
 */
export const getShopifyOAuthUrl = createServerFn({ method: 'POST' })
  .validator(z.object({ redirectUri: z.string().url() }))
  .handler(async ({ data }) => {
    try {
      const authData = await buildAuthorizeUrl(data.redirectUri);
      
      const isProd = process.env.NODE_ENV === 'production';
      
      // Set HttpOnly secure cookies for PKCE verification
      setCookie('shopify_pkce_verifier', authData.verifier, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
      });
      
      setCookie('shopify_oauth_state', authData.state, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
      });

      return {
        success: true,
        authorizeUrl: authData.authorizeUrl,
      };
    } catch (error: any) {
      console.error('Error generating Shopify OAuth URL:', error);
      throw new Error(error.message || 'Failed to initialize Shopify OAuth');
    }
  });

/**
 * Exchange authorization code for Customer Account API access token
 */
export const exchangeOAuthCode = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      code: z.string(),
      state: z.string(),
      redirectUri: z.string().url(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const verifier = getCookie('shopify_pkce_verifier');
      const savedState = getCookie('shopify_oauth_state');

      if (!verifier) {
        throw new Error('PKCE verifier missing from server session cookies.');
      }

      if (savedState && data.state && savedState !== data.state) {
        throw new Error('State mismatch detected. Authentication aborted.');
      }

      // Delete cookies after use (single use)
      deleteCookie('shopify_pkce_verifier');
      deleteCookie('shopify_oauth_state');

      const tokens = await exchangeCodeForTokens(data.code, verifier, data.redirectUri);
      const customerData = await fetchCustomerAccountData(tokens.access_token);
      
      const customerNode = customerData.data?.customer;
      const email = customerNode?.emailAddress?.emailAddress;
      const firstName = customerNode?.firstName || '';
      const lastName = customerNode?.lastName || '';
      const phone = customerNode?.phoneNumber?.phoneNumber || null;

      const customer = {
        id: customerNode?.id || 'shopify-customer',
        email: email || '',
        firstName,
        lastName,
        phone,
        displayName: `${firstName} ${lastName}`.trim() || email || 'Customer',
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
      console.error('OAuth code exchange error:', error);
      throw new Error(error.message || 'Failed to complete OAuth authentication');
    }
  });

