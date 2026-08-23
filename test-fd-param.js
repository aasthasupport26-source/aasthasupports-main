#!/usr/bin/env node

/**
 * Test the _fd=0 parameter appending logic
 */

// Simulate the logic from src/lib/shopify.functions.ts
function appendFdParameter(checkoutUrl) {
  let url = checkoutUrl;
  console.log("Original:", url);

  // This is the actual logic from the patched code
  if (!url.includes("_fd=0")) {
    url += (url.includes("?") ? "&" : "?") + "_fd=0";
  }

  console.log("After append:", url);
  return url;
}

// Test cases
const testUrls = [
  "https://www.aasthasupports.com/cart/c/abc123",
  "https://www.aasthasupports.com/cart/c/abc123?key=xyz",
  "https://www.aasthasupports.com/cart/c/abc123?_fd=0",
  "https://www.aasthasupports.com/cart/c/abc123?_fd=1",
  "https://08axwa-1x.myshopify.com/cart/c/abc123",
];

console.log("Testing _fd=0 parameter appending:\n");
testUrls.forEach((url) => {
  console.log("─".repeat(60));
  appendFdParameter(url);
  console.log();
});
