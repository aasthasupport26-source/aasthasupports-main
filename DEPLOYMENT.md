# 🚀 Deployment Guide - Aastha Support

## Pre-Deployment Checklist

### 1. Environment Setup (🚨 CRITICAL)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Generate secure secrets
openssl rand -base64 32  # Copy this to ADMIN_JWT_SECRET

# 3. Fill in all required credentials in .env
# See .env.example for all required variables
```

### 2. Required Services Configuration

#### Supabase (Database)
1. Go to https://supabase.com/dashboard
2. Create new project or use existing
3. Copy credentials to `.env`:
   - Project URL → `SUPABASE_URL`
   - Anon key → `SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Run migrations:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_ID
   
   # Push migrations
   supabase db push
   ```

#### Razorpay (Payment Gateway)
1. Go to https://dashboard.razorpay.com
2. Navigate to Settings → API Keys
3. Generate keys (use TEST for development, LIVE for production)
4. Copy to `.env`:
   - Key ID → `RAZORPAY_KEY_ID`
   - Key Secret → `RAZORPAY_KEY_SECRET`
5. Configure webhook:
   - URL: `https://yourdomain.com/api/webhooks/razorpay-puja`
   - Events: `payment.captured`, `payment.failed`
   - Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`

#### Shopify (E-commerce)
1. Go to your Shopify admin panel
2. Apps → Develop apps → Create app
3. Configure API scopes:
   - `read_products`
   - `write_customers`
   - `read_orders`
4. Copy credentials to `.env`:
   - Store domain → `SHOPIFY_STORE_DOMAIN`
   - Storefront access token → `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   - Admin access token → `SHOPIFY_ADMIN_ACCESS_TOKEN`
5. Configure OAuth:
   - Client ID → `SHOPIFY_CLIENT_ID`
   - Client secret → `SHOPIFY_CLIENT_SECRET`
   - Redirect URI: `https://yourdomain.com/auth/callback`

#### Sentry (Error Monitoring) - RECOMMENDED
1. Go to https://sentry.io
2. Create new project (React + Node.js)
3. Copy DSN to `.env`:
   - `SENTRY_DSN`
   - `VITE_SENTRY_DSN`

### 3. Build & Test Locally

```bash
# Install dependencies
npm install

# Run tests (must pass 100%)
npm test

# Build for production
npm run build

# Test production build locally
npm run preview
```

Expected output:
```
✓ 30 test files  201 passed (201)
```

### 4. Database Setup

```bash
# Apply all migrations
supabase db push

# Seed initial data (optional)
# Run SQL scripts in supabase/migrations/ in order
```

**Important Tables:**
- `users` - Customer and admin accounts
- `temples` - Temple/ashram directory
- `pujas` - Pooja/ritual catalog
- `packages` - Pricing tiers for each puja
- `pooja_bookings` - Booking records
- `booking_payments` - Payment transactions
- `revoked_tokens` - JWT blacklist
- `admin_audit_log` - Admin action audit trail

### 5. Enable Row Level Security (RLS)

**🚨 CRITICAL for production security**

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS on all sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pooja_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid() OR id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can only view their own bookings
CREATE POLICY "Users can view own bookings" ON pooja_bookings
  FOR SELECT USING (user_id = auth.uid() OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can only view their own payments
CREATE POLICY "Users can view own payments" ON booking_payments
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM pooja_bookings 
      WHERE user_id = auth.uid() OR user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Only service role can write bookings and payments (server-side only)
CREATE POLICY "Service role can insert bookings" ON pooja_bookings
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can insert payments" ON booking_payments
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Admin audit log is read-only for admins
CREATE POLICY "Admins can view audit logs" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_admin = true
    )
  );
```

## Deployment Options

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Project**
   ```bash
   vercel login
   vercel link
   ```

3. **Add Environment Variables**
   ```bash
   # Add each variable from .env
   vercel env add RAZORPAY_KEY_ID
   vercel env add RAZORPAY_KEY_SECRET
   # ... repeat for all variables
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Configure Custom Domain**
   ```bash
   vercel domains add yourdomain.com
   ```

### Option B: Cloudflare Pages

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare**
   - Go to Cloudflare Dashboard → Pages
   - Connect GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Output directory: `.output/public`
   - Add environment variables in dashboard

### Option C: Self-Hosted (VPS/Dedicated)

1. **Server Requirements**
   - Node.js 18+ (LTS)
   - 2GB RAM minimum
   - 20GB storage
   - Ubuntu 22.04 or similar

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd aasthasupports-main

   # Install dependencies
   npm install

   # Copy and configure environment
   cp .env.example .env
   nano .env  # Fill in credentials

   # Build
   npm run build

   # Start with PM2
   pm2 start npm --name "aastha-support" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment Verification

### 1. Health Checks

Visit these endpoints to verify:

- **Application**: `https://yourdomain.com`
- **API Health**: `https://yourdomain.com/api/health` (if implemented)
- **Shop**: `https://yourdomain.com/shop`
- **Admin**: `https://yourdomain.com/admin`

### 2. Test Critical Flows

```bash
# 1. User Registration & Login
# - Try registering a new user
# - Login with the new user

# 2. Product Browsing & Cart
# - Browse shop
# - Add product to cart
# - Update quantity
# - Remove from cart

# 3. Shopify Checkout
# - Proceed to checkout
# - Verify redirect to Shopify
# - Complete test purchase

# 4. Pooja Booking
# - Select temple and puja
# - Fill booking form
# - Complete Razorpay test payment
# - Verify booking appears in My Account

# 5. Admin Panel
# - Login as admin
# - View bookings
# - Update booking status
# - Check audit logs
```

### 3. Monitor Logs

```bash
# Vercel
vercel logs

# Cloudflare
# Check dashboard → Analytics → Logs

# Self-hosted
pm2 logs aastha-support
```

### 4. Set Up Monitoring

- **Uptime Monitoring**: UptimeRobot, Pingdom
  - Monitor: `/`, `/shop`, `/admin`
  - Alert on: >3 minute downtime

- **Error Tracking**: Sentry
  - Check errors are being captured
  - Set up alerts for critical errors

- **Performance**: Vercel Analytics / CloudFlare Analytics
  - Monitor page load times
  - Check API response times

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules .output dist
npm install
npm run build
```

### Environment Variables Not Loading

```bash
# Verify .env is not in .gitignore (it is by default)
# For Vercel/Cloudflare: Check dashboard environment variables
# For self-hosted: Ensure .env is in root directory
cat .env | grep RAZORPAY_KEY_ID
```

### Database Connection Issues

```bash
# Test Supabase connection
curl "https://YOUR_PROJECT.supabase.co/rest/v1/temples" \
  -H "apikey: YOUR_ANON_KEY"
```

### Payment Webhook Not Working

1. Check webhook URL is correct in Razorpay dashboard
2. Verify `RAZORPAY_WEBHOOK_SECRET` matches
3. Check webhook logs in Razorpay dashboard
4. Test webhook endpoint manually:
   ```bash
   curl -X POST https://yourdomain.com/api/webhooks/razorpay-puja \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test" \
     -d '{"event":"payment.captured"}'
   ```

## Maintenance

### Weekly Tasks
- [ ] Check Sentry for new errors
- [ ] Review Supabase logs
- [ ] Monitor payment reconciliation

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review rate limiting logs
- [ ] Check database backup status

### Quarterly Tasks
- [ ] Rotate `ADMIN_JWT_SECRET`
- [ ] Review and update security policies
- [ ] Performance audit
- [ ] Load testing

## Rollback Procedure

If deployment causes issues:

```bash
# Vercel
vercel rollback

# Cloudflare
# Use dashboard → Deployments → Rollback to previous

# Self-hosted
pm2 stop aastha-support
git checkout <previous-commit>
npm install
npm run build
pm2 restart aastha-support
```

## Support

For deployment issues:
- **Email**: aastha.support.26@gmail.com
- **Documentation**: See README.md and SECURITY.md

---

**Last Updated:** 2026-08-31  
**Version:** 1.0.0
