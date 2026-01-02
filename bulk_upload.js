import fetch from "node-fetch";
import fs from "fs";

const API = "https://cung-home-server.onrender.com/api/admin/products";
const TOKEN = "d4c85f01263737c833e7068ae5247a3f89e6c132cb917f36e94f38f4bed93c09";

const products = JSON.parse(fs.readFileSync("./bulk-products.json", "utf-8"));

(async () => {
  for (const product of products) {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(product),
    });
    console.log(`Upload ${product.name} → ${res.status}`);
  }
})();
