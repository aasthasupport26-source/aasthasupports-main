# Aastha Support

Authentic, certified, and Vedic-energised spiritual products — rudraksha, gemstones, malas, bracelets, yantras and live online poojas performed by learned pandits.

## Features

- 🛍️ E-commerce platform for spiritual products
- 🕉️ Online pooja booking system with live streaming
- 💳 Secure payment processing via Razorpay
- 📱 Responsive design for mobile and desktop
- 🔐 Secure authentication with Supabase
- 🛡️ WCAG 2.1 AA accessibility compliant
- ⚡ Built with modern web technologies

## Tech Stack

- **Framework:** TanStack Start (React)
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Razorpay
- **E-commerce:** Shopify integration
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Razorpay account (for payments)
- Shopify store (for product management)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aasthasupports.git
cd aasthasupports
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
SHOPIFY_STORE_DOMAIN=your_store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── booking/      # Booking-related components
│   └── ui/           # Base UI components
├── contexts/         # React contexts (Auth, Cart)
├── data/             # Static data (catalogs)
├── hooks/            # Custom React hooks
├── integrations/     # Third-party integrations
├── lib/              # Utility functions and helpers
├── routes/           # File-based routing
│   ├── admin/       # Admin dashboard routes
│   └── api/         # API endpoints
└── types/            # TypeScript type definitions
```

## Key Features

### Authentication
- Email/password authentication
- Social login (Google, Facebook)
- Admin role-based access control
- Session management with auto-refresh

### E-commerce
- Product catalog with categories
- Shopping cart with persistence
- Secure checkout with Razorpay
- Order tracking
- Shopify integration for inventory

### Pooja Booking
- Browse temples and poojas
- Select date, time, and package
- Provide sankalp details
- Live streaming of poojas
- Photo/video delivery options

### Admin Dashboard
- Manage products, categories, temples
- View and manage bookings
- Customer management
- Order tracking
- Analytics dashboard

## Security Features

- ✅ CSRF protection
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting
- ✅ Secure headers (CSP, HSTS)
- ✅ Authentication guards on admin routes
- ✅ Error boundaries for graceful failures

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- ARIA attributes
- Touch targets 44x44px minimum
- Pause controls for autoplay content

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

Build for production:
```bash
npm run build
```

The build output will be in the `.output` directory.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (server-side) | Yes |
| `SHOPIFY_STORE_DOMAIN` | Shopify store domain | Yes |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify API token | Yes |
| `SENTRY_DSN` | Sentry error tracking DSN | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email support@aasthasupport.com or call +91-99999-99999.

## Acknowledgments

- Vedic pandits for spiritual guidance
- Open source community for amazing tools
- Customers for their trust and faith

---

**Made with 🙏 by Aastha Support Team**
