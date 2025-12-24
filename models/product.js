import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
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

export default mongoose.model("Product", productSchema);
