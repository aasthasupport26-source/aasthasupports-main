import { loginShopifyCustomer } from "./src/lib/auth/shopify-customer";

async function main() {
  try {
    const res = await loginShopifyCustomer("test@example.com", "password");
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
