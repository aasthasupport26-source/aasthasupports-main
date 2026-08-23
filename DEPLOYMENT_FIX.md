# 🚨 DEPLOYMENT FIX - Production Issues

## Issue Found

Your deployment is failing because **environment variables are missing or not properly set**.

## ✅ Quick Fix Steps

### 1. Add Missing Environment Variable

Add this to your deployment platform (Vercel/Cloudflare/Netlify):

```bash
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

**Where to find it:**

- Go to Supabase Dashboard → Project Settings → API
- Copy the "anon public" key

### 2. Verify All Required Variables Are Set

Run this locally to check:

```bash
./check-deployment.sh
```

### 3. Set Variables in Deployment Platform

#### For Vercel:

```bash
# Go to: https://vercel.com/your-project/settings/environment-variables
# Add each variable, then redeploy
```

#### For Cloudflare Pages:

```bash
# Go to: Workers & Pages → Your Project → Settings → Environment Variables
# Add each variable under "Production", then redeploy
```

#### For Netlify:

```bash
# Go to: Site Settings → Environment Variables
# Add each variable, then redeploy
```

## 📋 Complete Environment Variables List

Copy these to your deployment platform:

```bash
# Supabase
VITE_SUPABASE_URL=https://nqxxdvyfcoxqloechtbx.supabase.co
VITE_SUPABASE_ANON_KEY=<get-from-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>

# Shopify
SHOPIFY_STORE_DOMAIN=08axwa-1x.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<get-from-shopify-admin>
SHOPIFY_ADMIN_ACCESS_TOKEN=<get-from-shopify-admin>
SHOPIFY_API_VERSION=2024-10
SHOPIFY_STORE_ID=101228675360
SHOPIFY_CLIENT_ID=8f4cdeb0-8b90-46d3-aaa7-b75bf1e5b89a
SHOPIFY_CLIENT_SECRET=<get-from-shopify-admin>
SHOPIFY_ACCOUNT_URL=https://shopify.com/101228675360/account

# App URLs
VITE_SHOPIFY_REDIRECT_URI=https://www.aasthasupports.com/auth/callback
```

## 🔍 How to Get Missing Keys

### Supabase Keys:

1. Go to https://supabase.com/dashboard
2. Select your project: `nqxxdvyfcoxqloechtbx`
3. Settings → API
4. Copy:
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Shopify Tokens:

1. Go to Shopify Admin → Apps
2. Create/select Storefront API app
3. Copy `Storefront Access Token` → `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
4. Create/select Admin API app
5. Copy `Admin Access Token` → `SHOPIFY_ADMIN_ACCESS_TOKEN`

## 🚀 After Setting Variables

1. **Redeploy** your application
2. **Test** these pages:
   - Homepage: https://www.aasthasupports.com
   - Shop: https://www.aasthasupports.com/shop
   - Product page: Click any product
   - Checkout: Add to cart → Checkout

## 🐛 Still Having Issues?

Check browser console (F12) for errors:

- `401 Unauthorized` → Wrong API keys
- `CORS error` → Check Supabase allowed origins
- `Redirect loop` → Checkout fix already applied
- `Products not loading` → Check Shopify token

## ✅ Verification Checklist

After deployment:

- [ ] Homepage loads without errors
- [ ] Shop page shows products
- [ ] Product pages load
- [ ] Add to cart works
- [ ] Checkout redirects (no loop)
- [ ] Profile/orders load (if logged in)
- [ ] No console errors in browser
