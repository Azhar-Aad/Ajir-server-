import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  category: { type: String, required: true },
  rentalPlace: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", ProductSchema);
