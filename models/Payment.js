import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

  nameOnCard: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,

  amountPaid: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", PaymentSchema);
