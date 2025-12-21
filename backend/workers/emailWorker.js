import { connectRabbitMQ, getChannel } from "../utils/rabbitmq.js";
import { sendEmail } from "../utils/sendEmail.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 🔥 Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📦 Worker connected to MongoDB"))
  .catch((err) => console.log("❌ Worker MongoDB Error:", err.message));

const startWorker = async () => {
  await connectRabbitMQ();
  const channel = getChannel();

  console.log("🐰 Worker started, listening for email jobs");

  channel.consume("emailQueue", async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      console.log("📩 Received job:", data);

      if (data.type === "PAYMENT_SUCCESS") {
        const order = await Order.findById(data.orderId).populate("user");

        if (!order) throw new Error("Order not found");

        const user = order.user;

        await sendEmail(
          user.email,
          "Your Payment Was Successful 🎉",
          `<h1>Order ${order._id} Paid</h1><p>Thanks for your purchase!</p>`
        );

        console.log("📧 Email sent to:", user.email);
      }

      channel.ack(msg); // Mark job successful
    } catch (err) {
      console.error("❌ Email worker error:", err.message);
      channel.nack(msg); // requeue for retry
    }
  });
};

startWorker();
