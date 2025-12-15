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
    process.env.MONGO_URI ||
      "mongodb+srv://12s2017:MyNewPass123@azharoo1244.kebzfzb.mongodb.net/AjirDatabase"
  )
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await createDefaultAdmin();
  })
  .catch((err) => console.error("❌ DB Error:", err));

/* ===================== CREATE DEFAULT ADMIN ===================== */
async function createDefaultAdmin() {
  const username = "admin";
  const plainPass = "1234";

  const admin = await Admin.findOne({ username });

  // If not exists -> create hashed
  if (!admin) {
    await Admin.create({
      username,
      password: await bcrypt.hash(plainPass, 10),
    });
    console.log("✅ Default admin created (hashed)");
    return;
  }

  // If exists but password is NOT hashed (old data), re-hash it automatically
  // bcrypt hashes usually start with $2a$ or $2b$ etc.
  const looksHashed = typeof admin.password === "string" && admin.password.startsWith("$2");
  if (!looksHashed) {
    admin.password = await bcrypt.hash(plainPass, 10);
    await admin.save();
    console.log("✅ Default admin password updated to hashed");
  }
}

/* ===================== AUTH ===================== */

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim()?.toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    res.json({ message: "Signup successful", userId: user._id });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim()?.toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error" });
  }
});

// ADMIN LOGIN
app.post("/admin-login", async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Admin login successful" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Admin login error" });
  }
});

/* ===================== PRODUCTS ===================== */

// ADD PRODUCT
app.post("/admin/add-product", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json({ message: "Product added successfully!", product });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(400).json({ message: err.message || "Add product failed" });
  }
});

// GET ALL
app.get("/products", async (_, res) => {
  res.json(await Product.find());
});

// GET BY ID
app.get("/products/:id", async (req, res) => {
  res.json(await Product.findById(req.params.id));
});

// GET BY CATEGORY
app.get("/products/category/:category", async (req, res) => {
  res.json(await Product.find({ category: req.params.category }));
});

// UPDATE PRODUCT
app.put("/admin/update-product/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(400).json({ message: err.message || "Update failed" });
  }
});

// DELETE PRODUCT
app.delete("/admin/delete-product/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});


app.post("/order", async (req, res) => {
  try {
    const order = await Order.create({
      userId: req.body.userId || "guest",

      name: req.body.name || "",
      email: req.body.email || "",
      phone: req.body.phone || "",

      product: {
        id: req.body.product?._id,
        category: req.body.product?.category,
        price: req.body.product?.price,
        image: req.body.product?.image,
      },

      rentalPeriod: {
        from: req.body.rentalPeriod?.from || req.body.from || "",
        to: req.body.rentalPeriod?.to || req.body.to || "",
      },

      quantity: req.body.quantity || 1,
      deliveryLocation: req.body.deliveryLocation || "",
      buildingAddress: req.body.buildingAddress || "",

      location: {
        latitude: req.body.location?.latitude || req.body.latitude || null,
        longitude: req.body.location?.longitude || req.body.longitude || null,
      },

      total: req.body.total || 0,
    });

    res.json({ orderId: order._id });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Order failed" });
  }
});

// GET ORDERS BY USER
app.get("/orders/:userId", async (req, res) => {
  res.json(await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 }));
});

app.post("/payment/complete", async (req, res) => {
  const order = await Order.findById(req.body.orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await Payment.create({
    orderId: order._id,
    paymentMethod: req.body.paymentMethod || "CARD",
    status: "SUCCESS",
    amountPaid: order.total || 0,
  });

  res.json({ message: "Payment successful" });
});


/* ===================== WISHLIST ===================== */
app.get("/wishlist/:userId", async (req, res) => {
  const items = await Wishlist.find({ userId: req.params.userId }).populate("productId");
  res.json(items.map((i) => i.productId));
});

app.post("/wishlist/toggle", async (req, res) => {
  const { userId, productId } = req.body;
  const exists = await Wishlist.findOne({ userId, productId });

  if (exists) await Wishlist.deleteOne({ userId, productId });
  else await Wishlist.create({ userId, productId });

  const items = await Wishlist.find({ userId }).populate("productId");
  res.json(items.map((i) => i.productId));
});

/* ===================== START ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
