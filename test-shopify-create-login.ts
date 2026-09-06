async function main() {
  const email = `test-${Date.now()}@example.com`;
  const password = "Password123!";

  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email }
        customerUserErrors { message }
      }
    }
  `;

  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { email, password } },
      }),
    },
  );

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}
main();
