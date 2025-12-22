// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Product from "./models/product.js"; // Đảm bảo file này tồn tại
import Banner from "./models/banner.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get("/api/banners", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Route test để kiểm tra server online
app.get("/", (req, res) => {
  res.send("🚀 Cưng Home API đang hoạt động!");
});

// ✅ Route chính để lấy danh sách sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () =>
      console.log(`✅ Server chạy tại port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
