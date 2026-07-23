import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabaseAdmin } from './auth/shopify-customer';

/**
 * Get all customers - admin only
 */
export const getAdminCustomers = createServerFn({ method: 'POST' })
  .validator(z.object({}))
  .handler(async () => {
    const { data: customers, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch customers');
    }

    return customers || [];
  });

/**
 * Delete customer - admin only
 */
export const deleteCustomer = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    // Don't allow deleting admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('email', data.email)
      .single();

    if (user?.is_admin) {
      throw new Error('Cannot delete admin account');
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', data.email);

    if (error) {
      throw new Error('Failed to delete customer');
    }

    return { success: true };
  });

/**
 * Get customer bookings - admin only
 */
export const getCustomerBookings = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { data: bookings, error } = await (supabaseAdmin as any)
      .from('pooja_bookings')
      .select('*')
      .eq('email', data.email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch bookings');
    }

    return bookings || [];
  });

/**
 * Get all bookings - admin only
 */
export const getAdminBookings = createServerFn({ method: 'POST' })
  .validator(z.object({}))
  .handler(async () => {
    const { data: bookings, error } = await (supabaseAdmin as any)
      .from('pooja_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch bookings');
    }

    return bookings || [];
  });

/**
 * Update booking status - admin only
 */
export const updateBookingStatus = createServerFn({ method: 'POST' })
  .validator(z.object({
    bookingId: z.string(),
    status: z.enum(['draft', 'confirmed', 'completed', 'cancelled']),
  }))
  .handler(async ({ data }) => {
    const { error } = await (supabaseAdmin as any)
      .from('pooja_bookings')
      .update({
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.bookingId);

    if (error) {
      throw new Error('Failed to update booking status');
    }

    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * TEMPLES MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminTemples = createServerFn({ method: 'POST' })
  .validator(z.object({}))
  .handler(async () => {
    const { data: temples, error } = await supabaseAdmin
      .from('temples')
      .select('id, name, city, state, description, active, created_at, updated_at')
      .order('name');
    if (error) throw new Error('Failed to fetch temples');
    return temples || [];
  });

export const createTemple = createServerFn({ method: 'POST' })
  .validator(z.object({
    name: z.string(),
    city: z.string(),
    state: z.string().optional(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    active: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { image_url, ...insertData } = data;
    const { error } = await supabaseAdmin.from('temples').insert(insertData);
    if (error) throw new Error('Failed to create temple: ' + error.message);
    return { success: true };
  });

export const updateTemple = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    state: z.string().optional(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    active: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { id, image_url, ...updateData } = data;
    const { error } = await supabaseAdmin.from('temples').update(updateData).eq('id', id);
    if (error) throw new Error('Failed to update temple: ' + error.message);
    return { success: true };
  });

export const deleteTemple = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('temples').delete().eq('id', data.id);
    if (error) throw new Error('Failed to delete temple: ' + error.message);
    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * PUJAS MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminPujas = createServerFn({ method: 'POST' })
  .validator(z.object({ templeId: z.string().optional() }))
  .handler(async ({ data }) => {
    let query = supabaseAdmin.from('pujas').select('*, temple:temples(name)').order('name');
    if (data.templeId) query = query.eq('temple_id', data.templeId);
    
    const { data: pujas, error } = await query;
    if (error) throw new Error('Failed to fetch pujas');
    return pujas || [];
  });

export const createPuja = createServerFn({ method: 'POST' })
  .validator(z.object({
    temple_id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    duration_minutes: z.number().optional(),
    benefits: z.any().optional(), // jsonb
    active: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('pujas').insert(data);
    if (error) throw new Error('Failed to create puja: ' + error.message);
    return { success: true };
  });

export const updatePuja = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.string(),
    temple_id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    image_url: z.string().optional(),
    duration_minutes: z.number().optional(),
    benefits: z.any().optional(), // jsonb
    active: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { id, ...updateData } = data;
    const { error } = await supabaseAdmin.from('pujas').update(updateData).eq('id', id);
    if (error) throw new Error('Failed to update puja: ' + error.message);
    return { success: true };
  });

export const deletePuja = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('pujas').delete().eq('id', data.id);
    if (error) throw new Error('Failed to delete puja: ' + error.message);
    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * PACKAGES MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminPackages = createServerFn({ method: 'POST' })
  .validator(z.object({ pujaId: z.string().optional() }))
  .handler(async ({ data }) => {
    let query = supabaseAdmin.from('packages').select('*, puja:pujas(name)').order('price');
    if (data.pujaId) query = query.eq('puja_id', data.pujaId);
    
    const { data: packages, error } = await query;
    if (error) throw new Error('Failed to fetch packages');
    return packages || [];
  });

export const createPackage = createServerFn({ method: 'POST' })
  .validator(z.object({
    puja_id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    includes: z.any().optional(), // jsonb
    active: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('packages').insert(data);
    if (error) throw new Error('Failed to create package: ' + error.message);
    return { success: true };
  });

export const updatePackage = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.string(),
    puja_id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    includes: z.any().optional(), // jsonb
    active: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { id, ...updateData } = data;
    const { error } = await supabaseAdmin.from('packages').update(updateData).eq('id', id);
    if (error) throw new Error('Failed to update package: ' + error.message);
    return { success: true };
  });

export const deletePackage = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('packages').delete().eq('id', data.id);
    if (error) throw new Error('Failed to delete package: ' + error.message);
    return { success: true };
  });
