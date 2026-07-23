import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getUserWithAdminStatus } from './auth/shopify-customer';

/**
 * Check if user is admin
 */
export const checkIsAdmin = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const user = await getUserWithAdminStatus(data.email);
    return { isAdmin: user?.is_admin || false };
  });
