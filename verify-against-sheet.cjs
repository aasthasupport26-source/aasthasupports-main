const { GraphQLClient } = require("graphql-request");
const https = require("https");

const SHOPIFY_STORE_DOMAIN = "08axwa-1x.myshopify.com";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = "2192d0d604875350d58a7156a7b51456";
const SHOPIFY_API_VERSION = "2024-10";

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const client = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
});

const GET_ALL_PRODUCTS = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          productType
          tags
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchGoogleSheet() {
  return new Promise((resolve, reject) => {
    const url =
      "https://docs.google.com/spreadsheets/d/1JHVFhjyb1-4Opm1qzTAHJTSUOQmWiaR17ce4Pv6qK8Q/export?format=csv&gid=971625564";

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const lines = data.split("\n").filter((l) => l.trim());
          const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
          const products = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
            const product = {};
            headers.forEach((h, i) => {
              product[h] = values[i] || "";
            });
            return product;
          });
          resolve(products);
        });
      })
      .on("error", reject);
  });
}

async function getShopifyProducts() {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const response = await client.request(GET_ALL_PRODUCTS, {
      first: 250,
      after: cursor,
    });

    const products = response.products.edges.map((e) => ({
      id: e.node.id,
      title: e.node.title,
      handle: e.node.handle,
      productType: e.node.productType || "",
      tags: e.node.tags || [],
    }));

    allProducts = allProducts.concat(products);
    hasNextPage = response.products.pageInfo.hasNextPage;
    cursor = response.products.pageInfo.endCursor;
  }

  return allProducts;
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("Fetching Google Sheets data...");
  const sheetProducts = await fetchGoogleSheet();
  console.log(`✓ Found ${sheetProducts.length} products in Google Sheets\n`);

  console.log("Fetching Shopify products...");
  const shopifyProducts = await getShopifyProducts();
  console.log(`✓ Found ${shopifyProducts.length} products in Shopify\n`);

  console.log("=".repeat(70));
  console.log("VERIFICATION REPORT");
  console.log("=".repeat(70));

  // Create normalized maps
  const sheetMap = new Map();
  sheetProducts.forEach((p) => {
    const key = normalizeTitle(p.Title || p.title || p.Name || p.name || "");
    if (key) sheetMap.set(key, p);
  });

  const shopifyMap = new Map();
  shopifyProducts.forEach((p) => {
    const key = normalizeTitle(p.title);
    shopifyMap.set(key, p);
  });

  // Find matches and mismatches
  const inBoth = [];
  const onlyInShopify = [];
  const onlyInSheet = [];

  shopifyProducts.forEach((sp) => {
    const key = normalizeTitle(sp.title);
    if (sheetMap.has(key)) {
      inBoth.push({ shopify: sp, sheet: sheetMap.get(key) });
    } else {
      onlyInShopify.push(sp);
    }
  });

  sheetProducts.forEach((sp) => {
    const key = normalizeTitle(sp.Title || sp.title || sp.Name || sp.name || "");
    if (key && !shopifyMap.has(key)) {
      onlyInSheet.push(sp);
    }
  });

  console.log(`\n✓ Products in BOTH: ${inBoth.length}`);
  console.log(`⚠ Products ONLY in Shopify: ${onlyInShopify.length}`);
  console.log(`⚠ Products ONLY in Sheet: ${onlyInSheet.length}`);

  if (onlyInShopify.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("Products in Shopify but NOT in Google Sheet:");
    console.log("=".repeat(70));
    onlyInShopify.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   Type: ${p.productType || "NONE"}`);
    });
  }

  if (onlyInSheet.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("Products in Google Sheet but NOT in Shopify:");
    console.log("=".repeat(70));
    onlyInSheet.forEach((p, i) => {
      const title = p.Title || p.title || p.Name || p.name || "UNKNOWN";
      console.log(`${i + 1}. ${title}`);
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  console.log(`Google Sheet: ${sheetProducts.length} products`);
  console.log(`Shopify:      ${shopifyProducts.length} products`);
  console.log(`Matched:      ${inBoth.length} products`);
  console.log(`Difference:   ${Math.abs(sheetProducts.length - shopifyProducts.length)} products`);

  if (inBoth.length === shopifyProducts.length && onlyInSheet.length === 0) {
    console.log("\n✅ PERFECT MATCH: All Shopify products are in the Google Sheet!");
  } else {
    console.log("\n⚠️  MISMATCH: Products differ between Shopify and Google Sheet");
  }
}

main().catch(console.error);
