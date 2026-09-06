import { loginShopifyCustomer } from "./src/lib/auth/shopify-customer.ts";
async function run() {
  try {
    const res = await loginShopifyCustomer("test@test.com", "password123");
    console.log("Success", res);
  } catch (e) {
    console.error("Error", e);
  }
}
run();
