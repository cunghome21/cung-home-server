// clear_products.js
import fetch from "node-fetch";

const API = "https://cung-home-server.onrender.com/api/admin/products";
const TOKEN = "d4c85f01263737c833e7068ae5247a3f89e6c132cb917f36e94f38f4bed93c09"; // 🔥 thay bằng token admin thật của bạn

(async () => {
  console.log("⏳ Đang xoá toàn bộ sản phẩm...");
  const res = await fetch(API, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (res.ok) {
    console.log("✅ Đã xoá toàn bộ sản phẩm cũ!");
  } else {
    console.log("❌ Lỗi xoá sản phẩm:", res.status);
    const text = await res.text();
    console.log(text);
  }
})();
