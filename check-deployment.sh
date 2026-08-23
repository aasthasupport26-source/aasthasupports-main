#!/bin/bash
# Quick deployment check script

echo "🔍 Checking deployment configuration..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

echo "✅ .env file exists"
echo ""

# Check required variables
echo "📋 Checking required environment variables:"
echo ""

required_vars=(
    "SHOPIFY_STORE_DOMAIN"
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN"
    "SHOPIFY_API_VERSION"
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
)

missing=0
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
        echo "✅ $var is set"
    else
        echo "❌ $var is MISSING"
        missing=$((missing + 1))
    fi
done

echo ""
if [ $missing -eq 0 ]; then
    echo "✅ All required variables are set"
else
    echo "❌ $missing variable(s) missing"
    echo ""
    echo "Add missing variables to your deployment platform:"
    echo "- Vercel: Project Settings → Environment Variables"
    echo "- Cloudflare: Settings → Environment Variables"
    echo "- Netlify: Site Settings → Environment Variables"
fi

echo ""
echo "🏗️  Build output directory: .output/"
if [ -d .output ]; then
    echo "✅ Build output exists"
else
    echo "❌ Build output not found - run 'npm run build' first"
fi
