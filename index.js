import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Product from "./models/product.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route để kiểm tra
app.get("/", (req, res) => {
  res.send("Cưng Home API đang chạy 🚀");
});

// ✅ Route chính lấy danh sách sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
