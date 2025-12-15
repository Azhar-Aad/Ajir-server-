import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";

// MODELS
import User from "./models/User.js";
import Admin from "./models/Admin.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Payment from "./models/Payment.js";
import Wishlist from "./models/Wishlist.js";

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

/* ===================== DATABASE ===================== */
mongoose
  .connect(
    "mongodb+srv://12s2017:MyNewPass123@azharoo1244.kebzfzb.mongodb.net/AjirDatabase"
  )
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await createDefaultAdmin();
  })
  .catch((err) => console.error("❌ DB Error:", err));

/* ===================== CREATE DEFAULT ADMIN ===================== */
async function createDefaultAdmin() {
  const exists = await Admin.findOne({ username: "admin" });

  if (!exists) {
    await Admin.create({
      username: "admin",
      password: await bcrypt.hash("1234", 10),
    });
    console.log("✅ Default admin created (hashed)");
  }
}

/* ===================== AUTH ===================== */

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    res.json({ message: "Signup successful", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN (FIXED)
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// ADMIN LOGIN (FIXED)
app.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Admin login successful" });
  } catch {
    res.status(500).json({ message: "Admin login error" });
  }
});

/* ===================== PRODUCTS ===================== */
app.post("/admin/add-product", async (req, res) => {
  const product = await Product.create(req.body);
  res.json({ message: "Product added successfully!", product });
});

app.get("/products", async (_, res) => {
  res.json(await Product.find());
});

app.get("/products/:id", async (req, res) => {
  res.json(await Product.findById(req.params.id));
});

app.get("/products/category/:category", async (req, res) => {
  res.json(await Product.find({ category: req.params.category }));
});

/* ===================== ORDERS ===================== */
app.post("/order", async (req, res) => {
  const order = await Order.create({
    userId: req.body.userId,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,

    product: {
      id: req.body.product._id,
      name: req.body.product.category,
      price: req.body.product.price,
      image: req.body.product.image,
    },

    rentalPeriod: {
      from: req.body.from,
      to: req.body.to,
    },

    deliveryLocation: req.body.deliveryLocation,
    buildingAddress: req.body.buildingAddress,
    quantity: req.body.quantity,
    total: req.body.total,

    location: {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
  });

  res.json({ orderId: order._id });
});

app.get("/orders/:userId", async (req, res) => {
  res.json(
    await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 })
  );
});

/* ===================== PAYMENT ===================== */
app.post("/payment/complete", async (req, res) => {
  const order = await Order.findById(req.body.orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await Payment.create({
    orderId: order._id,
    paymentMethod: req.body.paymentMethod || "CARD",
    status: "SUCCESS",
    amountPaid: order.total,
  });

  res.json({ message: "Payment successful" });
});

/* ===================== WISHLIST ===================== */
app.get("/wishlist/:userId", async (req, res) => {
  const items = await Wishlist.find({ userId: req.params.userId }).populate(
    "productId"
  );
  res.json(items.map((i) => i.productId));
});

app.post("/wishlist/toggle", async (req, res) => {
  const { userId, productId } = req.body;

  const exists = await Wishlist.findOne({ userId, productId });

  exists
    ? await Wishlist.deleteOne({ userId, productId })
    : await Wishlist.create({ userId, productId });

  const items = await Wishlist.find({ userId }).populate("productId");
  res.json(items.map((i) => i.productId));
});

/* ===================== START ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
