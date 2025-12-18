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

export default mongoose.model("Product", productSchema);
