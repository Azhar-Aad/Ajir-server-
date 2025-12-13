import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    // ---------------- USER INFO ----------------
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    civilId: {
      type: String,
    },

    // ---------------- PRODUCT INFO ----------------
    product: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
      },
    },

    // ---------------- RENTAL PERIOD ----------------
    rentalPeriod: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
    },

    // ---------------- ORDER DETAILS ----------------
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    deliveryLocation: {
      type: String,
      required: true,
    },

    buildingAddress: {
      type: String,
      required: true,
    },

    note: {
      type: String,
    },

    // ---------------- GPS LOCATION ----------------
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    // ---------------- PAYMENT ----------------
    total: {
      type: Number,
      required: true,
    },

    // ---------------- ORDER DATE ----------------
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export default mongoose.model("Order", OrderSchema);
