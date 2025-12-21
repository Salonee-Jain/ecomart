import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

app.use(cors());
runWebhookServer();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EcoMart API is running 🌱");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);


app.use("/api/cart", cartRoutes);


app.use(errorHandler);

export default app;
