# 🔒 Security Documentation

## Critical Security Requirements

### 1. Environment Variables

**NEVER commit `.env` files to git.** All sensitive credentials must be stored securely:

```bash
# Generate secure secrets
openssl rand -base64 32  # For ADMIN_JWT_SECRET

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Required Credentials Before Production

#### 🚨 BLOCKERS (Must have before launch):

- [ ] `ADMIN_JWT_SECRET` - Minimum 32 characters, cryptographically random
- [ ] `RAZORPAY_KEY_ID` - Production key from Razorpay dashboard
- [ ] `RAZORPAY_KEY_SECRET` - Production secret from Razorpay
- [ ] `RAZORPAY_WEBHOOK_SECRET` - Webhook secret for signature verification
- [ ] `SHOPIFY_CLIENT_SECRET` - OAuth client secret from Shopify

#### ⚠️ RECOMMENDED:

- [ ] `SENTRY_DSN` - Error monitoring and alerting
- [ ] `SHIPROCKET_EMAIL` - Automated shipping (if needed)
- [ ] `SHIPROCKET_PASSWORD` - Automated shipping (if needed)

### 3. Credential Rotation Schedule

| Credential | Rotation Frequency | Priority |
|------------|-------------------|----------|
| `ADMIN_JWT_SECRET` | Every 90 days | High |
| `RAZORPAY_KEY_SECRET` | Every 180 days | High |
| `SHOPIFY_CLIENT_SECRET` | Every 180 days | Medium |
| `SUPABASE_SERVICE_ROLE_KEY` | On compromise | Critical |

### 4. Security Headers

All responses include:
- `Content-Security-Policy` - XSS protection
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options: SAMEORIGIN` - Clickjacking protection
- `X-Content-Type-Options: nosniff` - MIME sniffing protection

Implemented in: `src/lib/security-headers.ts`

### 5. Authentication & Authorization

#### Admin Authentication:
- JWT-based with 15-minute access tokens
- 7-day refresh tokens
- Token revocation via blacklist (`revoked_tokens` table)
- All admin endpoints protected with `await requireAdmin()`

#### Customer Authentication:
- Shopify Customer Account API (OAuth PKCE flow)
- Shopify Storefront API for legacy tokens
- Session cookies with `httpOnly`, `secure`, `sameSite: lax`

### 6. Payment Security

#### Razorpay Integration:
- ✅ Server-side price validation (prevents tampering)
- ✅ HMAC-SHA256 signature verification with `crypto.timingSafeEqual()`
- ✅ Idempotency protection (duplicate payment prevention)
- ✅ Webhook signature verification
- ✅ Amount and currency validation

### 7. Rate Limiting

Active rate limits per endpoint:

| Endpoint Type | Limit | Window | Implementation |
|--------------|-------|--------|----------------|
| Global | 120 req/min | 60s | `src/lib/rate-limit.ts` |
| Auth | 5 req | 15 min | Login/Register |
| Payment | 10 req/min | 60s | Booking/Verify |
| Admin | 60 req/min | 60s | Admin operations |
| Contact | 3 req | 1 hour | Contact form |
| Webhook | 100 req/min | 60s | Payment webhooks |

### 8. Input Validation & Sanitization

All user inputs are:
1. **Type-validated** with Zod schemas
2. **Sanitized** via `src/lib/input-sanitizer.ts`:
   - HTML entity escaping
   - Tag stripping
   - Phone number validation (10-digit Indian)
   - Email normalization

### 9. CSRF Protection

Double-submit cookie pattern:
- `csrf_token` cookie (httpOnly)
- `x-csrf-token` header verification
- Constant-time comparison to prevent timing attacks

Implemented in: `src/lib/csrf-protection.ts`

### 10. Brute-Force Protection

Exponential lockout after failed login attempts:
- 5 failed attempts → account locked
- Lockout duration: exponential backoff (max 30 minutes)

Implemented in: `src/lib/brute-force-protection.ts`

## Security Checklist for Production

### Before Deployment:

- [ ] Rotate all credentials from development/staging
- [ ] Enable HTTPS/SSL on domain
- [ ] Configure Content Security Policy for production domains
- [ ] Set up Sentry error monitoring
- [ ] Enable database backups (Supabase)
- [ ] Configure rate limiting thresholds for expected traffic
- [ ] Test payment flow in Razorpay test mode
- [ ] Verify webhook signatures are working
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Review and enable Supabase RLS policies

### Week 1 After Launch:

- [ ] Monitor error rates in Sentry
- [ ] Check rate limiting logs for abuse
- [ ] Verify payment reconciliation
- [ ] Audit admin access logs
- [ ] Check for failed authentication attempts

### Monthly:

- [ ] Review Supabase audit logs
- [ ] Check for outdated dependencies: `npm audit`
- [ ] Review rate limiting effectiveness
- [ ] Analyze Sentry error patterns
- [ ] Verify backup restoration process

## Incident Response

### If Credentials Are Compromised:

1. **Immediate Actions** (within 1 hour):
   ```bash
   # 1. Revoke compromised tokens in respective dashboards:
   #    - Supabase: Generate new service role key
   #    - Razorpay: Regenerate API keys
   #    - Shopify: Regenerate access tokens
   
   # 2. Update .env with new credentials
   # 3. Restart all servers
   # 4. Force logout all admin sessions (clear revoked_tokens table)
   ```

2. **Within 24 hours**:
   - Review access logs for suspicious activity
   - Check database for unauthorized changes
   - Notify affected users if data was accessed
   - File incident report

3. **Within 1 week**:
   - Conduct security audit
   - Update security procedures
   - Implement additional monitoring

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Contact: **aastha.support.26@gmail.com** with subject line: `[SECURITY] <brief description>`

We aim to respond within 48 hours.

## Security Audit Log

| Date | Action | Details |
|------|--------|---------|
| 2026-08-31 | Initial security documentation created | All critical security measures documented |
| TBD | Production deployment | Security checklist completed |

---

**Last Updated:** 2026-08-31  
**Maintained By:** Aastha Support Engineering Team
