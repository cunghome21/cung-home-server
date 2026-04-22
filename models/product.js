import mongoose from "mongoose";

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

const productSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  name: String,
  price: String,
  size: String,
  color: String,
  material: String,
  type: String,
  image: String,
  gallery: [String],
  description: String,
  details: Object,
  stock: Number,
  tags: [String],
  isFeatured: Boolean,
}, { timestamps: true });

productSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    const baseSlug = createSlug(this.name);
    let slug = baseSlug;
    let count = 1;
    
    // Check for existing slug to prevent duplicates
    while (true) {
      const existing = await mongoose.models.Product.findOne({ slug: slug, _id: { $ne: this._id } });
      if (!existing) break;
      slug = `${baseSlug}-${count++}`;
    }
    
    this.slug = slug;
  }
  next();
});

export default mongoose.model("Product", productSchema);
