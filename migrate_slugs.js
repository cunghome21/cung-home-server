import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.js";

dotenv.config();

function createSlug(str) {
  return str
    ? str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .trim()
        .replace(/\s+/g, "-")
    : "";
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const products = await Product.find({});
    console.log(`Found ${products.length} total products.`);
    
    let updatedCount = 0;
    for (const p of products) {
      if (!p.slug) {
        const baseSlug = createSlug(p.name);
        let slug = baseSlug;
        let count = 1;
        while (true) {
          const existing = await Product.findOne({ slug: slug, _id: { $ne: p._id } });
          if (!existing) break;
          slug = `${baseSlug}-${count++}`;
        }
        
        p.slug = slug;
        await p.save();
        console.log(`✅ Updated slug for [${p.name}]: ${slug}`);
        updatedCount++;
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration Error:", err);
    process.exit(1);
  }
}

migrate();
