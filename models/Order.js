import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: String,

    // USER INFO
    name: String,
    email: String,
    phone: String,
    civilId: String,

    // PRODUCT INFO
    product: {
      id: mongoose.Schema.Types.ObjectId,
      category: String,
      price: Number,
      image: String,
    },

    // RENTAL PERIOD (NO REQUIRED)
    rentalPeriod: {
      from: String,
      to: String,
    },

    // ORDER DETAILS
    quantity: Number,
    deliveryLocation: String,
    buildingAddress: String,
    note: String,

    // GPS LOCATION (NO REQUIRED)
    location: {
      latitude: Number,
      longitude: Number,
    },

    // PAYMENT
    total: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
