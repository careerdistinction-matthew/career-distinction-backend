{
  "name": "career-distinction-backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.0.0",
    "nodemailer": "^6.9.13"
  }
}import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Career Distinction API Running");
});

// DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  packageType: String,
  service: String,
  resumeLink: String,
  details: String,
  status: {
    type: String,
    default: "Order Received"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Order", orderSchema);import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: "Career Distinction <career.distinction1@gmail.com>",
    to,
    subject,
    text
  });
};import express from "express";
import Order from "../models/Order.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);

    await sendEmail(
      order.email,
      "Order Received - Career Distinction",
      `Your order has been received. Status: ${order.status}`
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ORDERS (ADMIN)
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// UPDATE STATUS
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(order);
});

export default router;PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL=career.distinction1@gmail.com
EMAIL_PASS=your_gmail_app_password
