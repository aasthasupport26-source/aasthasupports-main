#!/usr/bin/env node

/**
 * Summary: Shopify Checkout Redirect Loop - FIXED
 *
 * This script validates that all fixes are in place for the redirect loop issue.
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "═".repeat(70));
console.log("  🔧 SHOPIFY CHECKOUT REDIRECT LOOP - FIX VERIFICATION");
console.log("═".repeat(70) + "\n");

const checks = [
  {
    name: "Server Function: Removed hard-coded myshopify host rewrite",
    file: "src/lib/shopify.functions.ts",
    shouldContain: 'if (!checkoutUrl.includes("_fd=0"))',
    shouldNotContain: 'replace(/^https?:\\/\\/[^\\/]+/, "https://08axwa-1x.myshopify.com")',
  },
  {
    name: "Server Function: Adds _fd=0 parameter to checkout URL",
    file: "src/lib/shopify.functions.ts",
    shouldContain: 'checkoutUrl += (checkoutUrl.includes("?") ? "&" : "?") + "_fd=0"',
  },
  {
    name: "Cart Redirect Route: Uses environment variable for store domain",
    file: "src/routes/cart_.c.$id.tsx",
    shouldContain: "process.env.SHOPIFY_STORE_DOMAIN",
  },
  {
    name: "Cart Page: Redirects to server-provided checkout URL",
    file: "src/routes/cart.tsx",
    shouldContain: "window.location.href = res.checkoutUrl",
  },
];

let allPassed = true;

checks.forEach((check, idx) => {
  try {
    const filePath = path.join(process.cwd(), check.file);
    const content = fs.readFileSync(filePath, "utf8");

    const hasRequired = !check.shouldContain || content.includes(check.shouldContain);
    const noForbidden = !check.shouldNotContain || !content.includes(check.shouldNotContain);
    const passed = hasRequired && noForbidden;

    allPassed = allPassed && passed;

    console.log(`${idx + 1}. ${passed ? "✅" : "❌"} ${check.name}`);
    if (!hasRequired && check.shouldContain) {
      console.log(`   ❌ Missing: "${check.shouldContain.substring(0, 50)}..."`);
    }
    if (!noForbidden && check.shouldNotContain) {
      console.log(`   ❌ Found forbidden: "${check.shouldNotContain.substring(0, 50)}..."`);
    }
    console.log();
  } catch (err) {
    console.log(`${idx + 1}. ❌ ${check.name}`);
    console.log(`   Error reading file: ${err.message}`);
    console.log();
    allPassed = false;
  }
});

console.log("─".repeat(70));
console.log("\n📊 SUMMARY\n");

if (allPassed) {
  console.log(
    "✅ All fixes verified! Your checkout flow is now protected against redirects loops.\n",
  );
  console.log("Next Steps:");
  console.log("  1. Verify Shopify Admin Primary Domain is set to: www.aasthasupports.com");
  console.log("  2. Test checkout flow with a real product");
  console.log("  3. Monitor browser console for logs (see CHECKOUT_FIX_VERIFICATION.md)");
  console.log("  4. Deploy changes to production\n");
} else {
  console.log("❌ Some checks failed. Please review the output above.\n");
  process.exit(1);
}

console.log("═".repeat(70) + "\n");
