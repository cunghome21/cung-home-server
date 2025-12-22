import fs from "fs";

const productGroups = [
  {
    type: "Sofa L",
    imageSet: [
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
    ],
    quantity: 12,
    priceRange: [10000000, 18000000],
  },
  {
    type: "Sofa Băng",
    imageSet: [
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
    ],
    quantity: 10,
    priceRange: [6000000, 10000000],
  },
  {
    type: "Sofa Bed",
    imageSet: [
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
    ],
    quantity: 10,
    priceRange: [8000000, 12000000],
  },
  {
    type: "Đôn",
    imageSet: [
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
    ],
    quantity: 8,
    priceRange: [1000000, 3000000],
  },
  {
    type: "Ghế đơn",
    imageSet: [
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
      "https://fozfurniture.com/wp-content/uploads/2023/11/Nice-Sofa-FOZ-Furniture.webp",
    ],
    quantity: 10,
    priceRange: [4000000, 8000000],
  },
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatPrice(number) {
  return number.toLocaleString("vi-VN") + "đ";
}

function createProducts() {
  const products = [];
  let index = 1;

  productGroups.forEach((group) => {
    for (let i = 0; i < group.quantity; i++) {
      const featured = index <= 5; // 5 sản phẩm đầu tiên là nổi bật
      const price = randomBetween(...group.priceRange);

      products.push({
        name: `${group.type} cao cấp Cưng Home - Mã ${group.type
          .replace(/\s/g, "")
          .toUpperCase()}${1000 + index}`,
        price: formatPrice(price),
        size: `Dài ${randomBetween(180, 280)}cm x Rộng ${randomBetween(
          80,
          200
        )}cm`,
        color: ["Xám nhạt", "Be sáng", "Xanh navy", "Nâu cà phê", "Kem sữa"][
          randomBetween(0, 4)
        ],
        material: [
          "Vải nỉ cao cấp, khung gỗ sồi tự nhiên",
          "Da tổng hợp cao cấp, khung thép sơn tĩnh điện",
          "Nệm mút D40, vải nhung nhập khẩu",
        ][randomBetween(0, 2)],
        type: group.type,
        image: group.imageSet[0],
        gallery: group.imageSet,
        description: `${group.type} cao cấp với thiết kế tinh tế, đường nét hiện đại, phù hợp không gian phòng khách sang trọng. Vải và nệm chất lượng cao mang lại cảm giác êm ái và đẳng cấp.`,
        details: {
          "bảo hành": "24 tháng",
          "thương hiệu": "Cưng Home",
          "xuất xứ": "Việt Nam",
          "phong cách": "Hiện đại Bắc Âu",
        },
        stock: randomBetween(3, 10),
        tags: ["cao cấp", "hiện đại", "phòng khách"],
        isFeatured: featured,
        createdAt: new Date().toISOString(),
      });

      index++;
    }
  });

  return products;
}

// Sinh dữ liệu và ghi ra file JSON
const data = createProducts();
fs.writeFileSync("products_sample.json", JSON.stringify(data, null, 2), "utf-8");
console.log("✅ Đã tạo file products_sample.json (50 sản phẩm showroom Cưng Home)");
