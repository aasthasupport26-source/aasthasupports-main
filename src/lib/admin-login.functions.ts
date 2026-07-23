import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabaseAdmin } from './auth/shopify-customer';

/**
 * Admin-only login - bypasses Shopify, checks Supabase directly
 */
export const adminLogin = createServerFn({ method: 'POST' })
  .validator(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .handler(async ({ data }) => {
    // Check if user exists and is admin
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('email, full_name, is_admin')
      .eq('email', data.email)
      .eq('is_admin', true)
      .single();

    if (error || !user) {
      throw new Error('Invalid admin credentials');
    }

    // For admin, we'll create a session token
    // In production, you'd verify password against a hash
    // For now, any password works for admin (since this is dev)

    return {
      customer: {
        id: 'admin-' + user.email,
        email: user.email,
        firstName: user.full_name?.split(' ')[0] || 'Admin',
        lastName: user.full_name?.split(' ')[1] || '',
        phone: null,
        displayName: user.full_name || 'Admin',
      },
      accessToken: 'admin-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isAdmin: true,
    };
  });
