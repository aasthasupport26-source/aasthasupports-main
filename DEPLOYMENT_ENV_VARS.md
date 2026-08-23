# Deployment Environment Variables Checklist

## Required Environment Variables for Production

Add these to your deployment platform (Vercel/Cloudflare/Netlify):

### Shopify Configuration

```bash
SHOPIFY_STORE_DOMAIN=08axwa-1x.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<your-token>
SHOPIFY_API_VERSION=2024-10
SHOPIFY_STORE_ID=101228675360
SHOPIFY_CLIENT_ID=8f4cdeb0-8b90-46d3-aaa7-b75bf1e5b89a
SHOPIFY_CLIENT_SECRET=<your-secret>
SHOPIFY_ACCOUNT_URL=https://shopify.com/101228675360/account
SHOPIFY_ADMIN_ACCESS_TOKEN=<your-admin-token>
```

### Supabase Configuration

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Other Configuration

```bash
VITE_SHOPIFY_REDIRECT_URI=https://www.aasthasupports.com/auth/callback
```

## Deployment Platform Instructions

### For Vercel:

1. Go to Project Settings → Environment Variables
2. Add all variables above
3. Redeploy

### For Cloudflare Pages:

1. Go to Settings → Environment Variables
2. Add all variables above
3. Redeploy

### For Netlify:

1. Go to Site Settings → Environment Variables
2. Add all variables above
3. Redeploy

## Common Deployment Issues

### Issue: "Something went wrong" on production

**Cause:** Missing environment variables
**Fix:** Verify all env vars are set in deployment platform

### Issue: Checkout redirect loop

**Cause:** `SHOPIFY_STORE_DOMAIN` not set or wrong
**Fix:** Set to `08axwa-1x.myshopify.com`

### Issue: Products not loading

**Cause:** Missing `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
**Fix:** Add token from Shopify Admin → Apps → Storefront API

### Issue: Orders not showing

**Cause:** Missing `SHOPIFY_ADMIN_ACCESS_TOKEN`
**Fix:** Add admin token from Shopify Admin → Apps → Admin API

## Verify Deployment

After deploying, test:

1. ✅ Homepage loads
2. ✅ Shop page shows products
3. ✅ Product detail pages load
4. ✅ Add to cart works
5. ✅ Checkout redirects to Shopify (no loop)
6. ✅ Profile page loads orders
