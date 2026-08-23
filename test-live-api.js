const fetch = require("node-fetch");
(async () => {
  const res = await fetch(
    "https://www.aasthasupports.com/_server/?payload=%7B%22data%22%3A%7B%22items%22%3A%5B%7B%22merchandiseId%22%3A%22gid%3A%2F%2Fshopify%2FProductVariant%2F47352349196582%22%2C%22quantity%22%3A1%7D%5D%7D%2C%22serverFnId%22%3A%22createShopifyCheckout%22%7D",
    {
      method: "POST",
    },
  );
  const text = await res.text();
  console.log("Response:", text);
})();
