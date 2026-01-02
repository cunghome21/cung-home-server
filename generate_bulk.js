// generate_bulk.js
import fetch from "node-fetch";
import fs from "fs";

const GITHUB_API =
  "https://api.github.com/repos/cunghome21/sofa-image/git/trees/main?recursive=1";

(async () => {
  console.log("⏳ Đang quét repo GitHub...");
  const res = await fetch(GITHUB_API);
  const data = await res.json();

  if (!data.tree) {
    console.error("❌ Không lấy được danh sách file.");
    return;
  }

  // Lọc chỉ ảnh
  const imageFiles = data.tree.filter((f) =>
    /\.(jpg|jpeg|png|webp)$/i.test(f.path)
  );

  const productsMap = {};

  for (const file of imageFiles) {
    const parts = file.path.split("/");
    if (parts.length < 3) continue;

    const [typeRaw, folderRaw] = parts;
    const type = typeRaw.trim();
    const folder = folderRaw.trim();
    const imageUrl = `https://raw.githubusercontent.com/cunghome21/sofa-image/main/${file.path}`;

    // ✅ Làm sạch tên, tránh lặp “Sofa Sofa …”
    let cleanType = type.replace(/^sofa\s*/i, "Sofa ").trim();
    let cleanName = folder.replace(/_/g, " ").trim();

    // Nếu tên đã có từ "sofa" thì không thêm lại
    if (cleanName.toLowerCase().includes("sofa")) {
      cleanType = "";
    }

    const productKey = `${type}/${folder}`;

    if (!productsMap[productKey]) {
      productsMap[productKey] = {
        name: `${cleanType} ${cleanName}`.trim(),
        price: "Liên hệ",
        size: "Tuỳ chỉnh",
        color: "Tuỳ chọn",
        material: "Bố Nhung, Nhung, Nỉ, Lông cừu,...",
        type: cleanType || "Khác",
        image: imageUrl,
        gallery: [],
        description: `Mẫu ${cleanName} thuộc dòng ${cleanType || type}, thiết kế hiện đại, tinh tế, phù hợp mọi không gian phòng khách. Được làm từ chất liệu cao cấp, khung gỗ tự nhiên và đệm mút êm ái.`,
        details: {
          "bảo hành": "24 tháng",
          "thương hiệu": "Cưng Home",
          "xuất xứ": "Việt Nam",
          "phong cách": "Hiện đại",
        },
        specs: { dài: 260, rộng: 180, cao: 85 },
        stock: 5,
        tags: ["sofa", cleanName.toLowerCase()],
        isFeatured: false,
        createdAt: new Date().toISOString(),
      };
    }

    productsMap[productKey].gallery.push(imageUrl);
  }

  const products = Object.values(productsMap);

  fs.writeFileSync("bulk-products.json", JSON.stringify(products, null, 2), "utf-8");
  console.log(`✅ Đã tạo bulk-products.json (${products.length} sản phẩm)`);
})();
