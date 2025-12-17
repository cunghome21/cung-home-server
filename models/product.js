import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: String,
    size: String,
    color: String,
    type: String,
    image: String,
    description: String,
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
