import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  civilId: String,

  product: {
    id: String,
    name: String,
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
  note: String,

  total: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", OrderSchema);
