import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Banner from "./models/banner.js";
import Product from "./models/product.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Middleware bảo mật cho admin
app.use("/api/admin", (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === `Bearer ${process.env.ADMIN_TOKEN}`) next();
  else res.status(401).json({ error: "Unauthorized" });
});

// ✅ API PUBLIC
app.get("/", (req, res) => res.send("🚀 Cưng Home API đang hoạt động!"));

// Public - Banners
app.get("/api/banners", async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
});

// Public - Products
app.get("/api/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ ADMIN API (có token)
app.get("/api/admin/banners", async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
});

app.post("/api/admin/banners", async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/banners/:id", async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// PRODUCTS CRUD (Admin)
app.get("/api/admin/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post("/api/admin/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at port ${PORT}`));
