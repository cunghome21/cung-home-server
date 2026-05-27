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

// 🔍 Middleware Log Request (Để debug lỗi 404)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`📡 [${req.method}] ${req.path}`);
  }
  next();
});

// ✅ Kết nối MongoDB với môi trường dev/prod
const NODE_ENV = process.env.NODE_ENV || "production";
const MONGODB_URI = NODE_ENV === "development"
  ? (process.env.MONGODB_URI_DEV || process.env.MONGODB_URI)
  : (process.env.MONGODB_URI_PROD || process.env.MONGODB_URI);

console.log(`🔧 Running in ${NODE_ENV.toUpperCase()} mode`);

if (!MONGODB_URI) {
  console.error(
    "❌ MongoDB URI not set. Create a .env from .env.example or set MONGODB_URI_DEV / MONGODB_URI_PROD (or MONGODB_URI) environment variables."
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log(`✅ Connected to MongoDB Atlas (${NODE_ENV})`))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ API PUBLIC
app.get("/", (req, res) => res.send("🚀 Cưng Home API đang hoạt động!"));

/**
 * 🔐 ADMIN ROUTER
 * Định nghĩa tất cả route admin trước khi gắn vào app
 */
const adminRouter = express.Router();

adminRouter.use((req, res, next) => {
  if (req.method === "OPTIONS") return next(); // Cho phép preflight request của CORS
  const auth = req.headers.authorization;
  if (auth === `Bearer ${process.env.ADMIN_TOKEN}`) next();
  else res.status(401).json({ error: "Unauthorized" });
});

adminRouter.get("/banners", async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
});

adminRouter.post("/banners", async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete("/banners/:id", async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// PRODUCTS CRUD (Admin)
adminRouter.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

adminRouter.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gắn Admin Router vào app
app.use("/api/admin", adminRouter);

// --- PUBLIC API ---
app.get("/api/banners", async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
});

app.get("/api/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.get("/api/products/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.isValidObjectId(idOrSlug);
    const query = { $or: [{ slug: idOrSlug }] };
    if (isObjectId) query.$or.push({ _id: idOrSlug });

    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🩺 Route kiểm tra tình trạng server
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server đang hoạt động tốt 🚀" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at port ${PORT}`));
