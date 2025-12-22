import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  image: String,
  title: String,
  subtitle: String,
  buttonText: String,
  buttonLink: String,
  order: Number
});

export default mongoose.model("Banner", bannerSchema);
