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
import Wishlist from "./models/Wishlist.js";  // ⭐ NEW MODEL

const app = express();

// ----------------------------------------------
// MIDDLEWARE
// ----------------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// ----------------------------------------------
// CONNECT TO MONGO
// ----------------------------------------------
mongoose
  .connect("mongodb+srv://12s2017:MyNewPass123@azharoo1244.kebzfzb.mongodb.net/AjirDatabase")
  .then(() => {
    console.log("MongoDB Connected");
    createDefaultAdmin();
  })
  .catch((err) => console.error("DB Error:", err));

// ----------------------------------------------
// CREATE DEFAULT ADMIN
// ----------------------------------------------
async function createDefaultAdmin() {
  const exists = await Admin.findOne({ username: "admin" });
  if (!exists) {
    await Admin.create({
      username: "admin",
      password: "1234",
    });
    console.log("Default admin created");
  }
}

// ----------------------------------------------
// USER SIGNUP
// ----------------------------------------------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanedEmail = email.trim().toLowerCase().replace(/\.+$/, "");
    const existing = await User.findOne({ email: cleanedEmail });

    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: cleanedEmail,
      password: hashedPassword,
    });

    res.json({ message: "Signup successful", userId: user._id });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// USER LOGIN
// ----------------------------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanedEmail = email.trim().toLowerCase().replace(/\.+$/, "");

    const user = await User.findOne({ email: cleanedEmail });

    if (!user) return res.status(400).json({ message: "Email not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// ADMIN LOGIN
// ----------------------------------------------
app.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    if (password !== admin.password)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({ message: "Admin login successful" });

  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// ADD PRODUCT
// ----------------------------------------------
app.post("/admin/add-product", async (req, res) => {
  try {
    const { category, rentalPlace, description, quantity, price, image } = req.body;

    if (!category || !rentalPlace || !quantity || !price)
      return res.status(400).json({ message: "Missing required fields" });

    const product = await Product.create({
      category,
      rentalPlace,
      description,
      quantity,
      price,
      image,
    });

    res.json({ message: "Product added successfully!", product });

  } catch (err) {
    console.error("Product Add Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// GET ALL PRODUCTS
// ----------------------------------------------
app.get("/products", async (req, res) => {
  try {
    const list = await Product.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// GET PRODUCTS BY CATEGORY
// ----------------------------------------------
app.get("/products/category/:category", async (req, res) => {
  try {
    const list = await Product.find({ category: req.params.category });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// GET PRODUCT BY ID
// ----------------------------------------------
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// UPDATE PRODUCT
// ----------------------------------------------
app.put("/admin/update-product/:id", async (req, res) => {
  try {
    const { category, rentalPlace, description, quantity, price, image } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { category, rentalPlace, description, quantity, price, image },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully!", product: updated });

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// DELETE PRODUCT
// ----------------------------------------------
app.delete("/admin/delete-product/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully!" });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// ⭐ CREATE ORDER
// ----------------------------------------------
app.post("/order", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      civilId,
      from,
      to,
      delivery,
      address,
      note,
      quantity,
      total,
      product,
    } = req.body;

    if (!product || !product._id) {
      return res.status(400).json({ message: "Product details missing" });
    }

    const newOrder = await Order.create({
      name,
      email,
      phone,
      civilId,
      rentalPeriod: { from, to },
      deliveryLocation: delivery,
      buildingAddress: address,
      note,
      quantity,
      total,
      product: {
        id: product._id,
        name: product.productName,
        price: product.price,
        image: product.image,
      },
    });

    res.json({
      message: "Order created successfully",
      orderId: newOrder._id,
    });

  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// ⭐ PAYMENT COMPLETE
// ----------------------------------------------
app.post("/payment/complete", async (req, res) => {
  try {
    const { orderId, nameOnCard, cardNumber, expiryDate, cvv } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID missing" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    const payment = await Payment.create({
      orderId,
      nameOnCard,
      cardNumber,
      expiryDate,
      cvv,
      amountPaid: order.total,
    });

    await Product.updateOne(
      { _id: order.product.id },
      { $inc: { quantity: -order.quantity } }
    );

    res.json({
      message: "Payment successful",
      paymentId: payment._id,
    });

  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// ⭐⭐⭐ WISHLIST API (FULL)
// ----------------------------------------------

// GET ALL WISHLIST ITEMS FOR USER (returns product details)
app.get("/wishlist/:userId", async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.params.userId })
      .populate("productId");

    // Convert to clean array
    const products = items.map((i) => i.productId);

    res.json(products);

  } catch (err) {
    console.error("Wishlist Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ADD TO WISHLIST
// ⭐ TOGGLE WISHLIST
app.post("/wishlist/toggle", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Check if product exists in wishlist
    const exists = await Wishlist.findOne({ userId, productId });

    if (exists) {
      // Remove it
      await Wishlist.findOneAndDelete({ userId, productId });
    } else {
      // Add it
      await Wishlist.create({ userId, productId });
    }

    // Return updated list
    const items = await Wishlist.find({ userId }).populate("productId");
    const products = items.map((i) => i.productId);

    res.json(products);

  } catch (err) {
    console.error("Wishlist Toggle Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// REMOVE FROM WISHLIST
app.delete("/wishlist/:userId/:productId", async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      userId: req.params.userId,
      productId: req.params.productId,
    });

    res.json({ message: "Removed from wishlist" });

  } catch (err) {
    console.error("Wishlist Remove Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// START SERVER
// ----------------------------------------------
app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
