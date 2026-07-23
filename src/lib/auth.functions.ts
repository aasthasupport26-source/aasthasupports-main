import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  createShopifyCustomer,
  loginShopifyCustomer,
  getShopifyCustomer,
  logoutShopifyCustomer,
  syncShopifyCustomerToSupabase,
  supabaseAdmin,
} from './auth/shopify-customer';

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
