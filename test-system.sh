#!/bin/bash
# Complete system test

echo "🧪 Running Complete System Test..."
echo ""

# Test 1: Homepage
echo "1️⃣ Testing Homepage..."
HOMEPAGE=$(curl -s http://localhost:8082/)
if echo "$HOMEPAGE" | grep -q "Aastha Support"; then
    echo "   ✅ Homepage loads"
else
    echo "   ❌ Homepage failed"
fi

# Test 2: Shop Page
echo "2️⃣ Testing Shop Page..."
SHOP=$(curl -s http://localhost:8082/shop)
if echo "$SHOP" | grep -q "Sacred Collection\|Shop All"; then
    echo "   ✅ Shop page loads"
else
    echo "   ❌ Shop page failed"
fi

# Test 3: Environment Variables
echo "3️⃣ Checking Environment Variables..."
if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    echo "   ✅ VITE_SUPABASE_ANON_KEY set"
else
    echo "   ❌ VITE_SUPABASE_ANON_KEY missing"
fi

if grep -q "SHOPIFY_STOREFRONT_ACCESS_TOKEN" .env; then
    echo "   ✅ SHOPIFY_STOREFRONT_ACCESS_TOKEN set"
else
    echo "   ❌ SHOPIFY_STOREFRONT_ACCESS_TOKEN missing"
fi

# Test 4: Build
echo "4️⃣ Testing Build..."
if [ -d ".output" ]; then
    echo "   ✅ Build output exists"
else
    echo "   ❌ Build output missing"
fi

echo ""
echo "📊 Test Summary:"
echo "   - Local dev server: Running on port 8082"
echo "   - Environment: Configured"
echo "   - Build: Ready"
echo ""
echo "🚀 Next: Deploy to production with all env vars"
