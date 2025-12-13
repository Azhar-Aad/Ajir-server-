import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // "guest" or user._id
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
