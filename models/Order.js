import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    name: String,
    email: String,
    phone: String,

    product: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      category: String,
      price: Number,
      image: String,
    },

    rentalPeriod: {
      from: String,
      to: String,
    },

    quantity: Number,

    deliveryLocation: String,
    buildingAddress: String,

    location: {
      latitude: Number,
      longitude: Number,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
