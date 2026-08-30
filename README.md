# 🕉️ Aastha Support

> Authentic, certified, and Vedic-energised spiritual products — rudraksha, gemstones, malas, bracelets, yantras and live online poojas performed by learned pandits.

[![Tests](https://img.shields.io/badge/tests-202%20passing-brightgreen)]()
[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)]()
[![Security](https://img.shields.io/badge/security-enhanced-blue)]()

## ✨ Features

- 🛍️ **E-commerce Platform** - Certified spiritual products with Shopify integration
- 🕉️ **Online Pooja Booking** - Live streaming with real pandits
- 💳 **Secure Payments** - Razorpay integration with signature verification
- 📱 **Responsive Design** - Optimized for mobile and desktop
- 🔐 **Enterprise Security** - CSRF, rate limiting, RLS policies, JWT authentication
- 🛡️ **WCAG 2.1 AA Compliant** - Fully accessible
- ⚡ **Modern Stack** - React 19, TanStack Router, TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Razorpay account
- Shopify store

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/aasthasupports.git
cd aasthasupports

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials (see .env.example for details)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[SECURITY.md](SECURITY.md)** - Security policies and procedures
- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - Production readiness checklist

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | TanStack Start (React 19) |
| **Routing** | TanStack Router |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Shopify Customer API + JWT |
| **Payments** | Razorpay |
| **E-commerce** | Shopify Storefront API |
| **Deployment** | Vercel / Cloudflare Pages |
| **Monitoring** | Sentry |

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── booking/         # Booking flow components
│   ├── ui/              # Base UI components
│   └── Layout.tsx       # Main layout wrapper
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── CartContext.tsx  # Shopping cart state
├── lib/                 # Server functions & utilities
│   ├── *.functions.ts   # Server-side API functions
│   ├── env.ts           # Environment validation
│   ├── logger.ts        # Logging service (NEW)
│   └── security-*.ts    # Security utilities
├── routes/              # File-based routing
│   ├── admin/          # Admin dashboard
│   ├── api/            # API endpoints
│   └── *.tsx           # Public pages
└── integrations/        # Third-party integrations

supabase/
└── migrations/          # Database migrations
    └── 20260831_enable_rls_policies.sql  # NEW: RLS policies

tests/                   # 202 passing tests ✅
```

## 🔒 Security Features

### Enhanced Security (v1.0.0)

- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Environment Validation** - Comprehensive credential validation
- ✅ **CSRF Protection** - Double-submit cookie pattern
- ✅ **Rate Limiting** - Per-endpoint limits
- ✅ **Brute-Force Protection** - Exponential lockout
- ✅ **JWT Authentication** - Admin tokens with revocation
- ✅ **Input Sanitization** - XSS and injection prevention
- ✅ **Payment Verification** - HMAC-SHA256 signature validation
- ✅ **Security Headers** - CSP, HSTS, X-Frame-Options
- ✅ **Error Monitoring** - Sentry integration with data scrubbing

See [SECURITY.md](SECURITY.md) for complete details.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

**Test Coverage:** 202 tests passing (100%) ✅

## 🔧 Key Features

### Authentication & Authorization
- Shopify Customer Account API (OAuth PKCE)
- Admin JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Session management with httpOnly cookies

### E-commerce
- Product catalog with Shopify sync
- Shopping cart with localStorage persistence
- Secure checkout with price validation
- Order tracking and history
- Inventory management via Shopify

### Pooja Booking System
- Temple and puja catalog
- Multi-tier packages
- Sankalp (devotee details) collection
- Razorpay payment integration
- 2% processing fee calculation
- Booking confirmation with QR codes

### Admin Dashboard
- Booking management with status updates
- User and role management
- Temple/Puja/Package CRUD
- Audit log tracking
- Analytics and reports

## 📊 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /shop` - Product catalog
- `GET /product/:slug` - Product details
- `POST /api/contact` - Contact form

### Protected Endpoints
- `POST /api/booking/create` - Create booking
- `POST /api/payment/verify` - Verify payment
- `GET /api/bookings/user` - User's bookings

### Admin Endpoints (JWT required)
- `GET /api/admin/bookings` - All bookings
- `POST /api/admin/booking/update` - Update booking
- `GET /api/admin/users` - User management

## 🌐 Environment Variables

See [.env.example](.env.example) for complete list.

**Critical Variables:**
- `ADMIN_JWT_SECRET` - Minimum 32 characters (generate: `openssl rand -base64 32`)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Payment gateway
- `SHOPIFY_CLIENT_SECRET` - OAuth authentication
- `SUPABASE_SERVICE_ROLE_KEY` - Database access

## 🚢 Deployment

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions for Vercel, Cloudflare Pages, and self-hosted options.

## 📈 Monitoring & Logging

### Logging
- Structured logging via `src/lib/logger.ts`
- Log levels: debug, info, warn, error, critical
- JSON format in production
- Sentry integration for errors

### Health Checks
- `GET /api/health` - Overall system health
- Monitors: Database, Shopify, Razorpay
- Returns: status, uptime, response times

### Error Tracking
- Sentry integration (optional but recommended)
- Automatic error reporting
- Performance monitoring
- Sensitive data scrubbing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Run `npm test` before committing

## 📝 License

This project is proprietary and confidential.

## 📞 Support

- **Email:** aastha.support.26@gmail.com
- **Phone:** +91-99999-99999
- **WhatsApp:** [Contact Us](https://wa.me/919999999999)

## 🙏 Acknowledgments

- Vedic pandits for spiritual guidance
- Open source community
- Our customers for their trust

---

**Made with 🙏 and 💻 by Aastha Support Engineering Team**

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Tests:** 202 passing
