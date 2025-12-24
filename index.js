import Banner from "./models/banner.js";
import Product from "./models/product.js";

// Middleware đơn giản (bảo mật cơ bản)
app.use("/api/admin", (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === `Bearer ${process.env.ADMIN_TOKEN}`) next();
  else res.status(401).json({ error: "Unauthorized" });
});

// ✅ CRUD Banner
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

// ✅ CRUD Product
app.get("/api/admin/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/api/admin/products", async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
