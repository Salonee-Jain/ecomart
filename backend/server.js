import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectRabbitMQ } from "./utils/rabbitmq.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

connectDB();
connectRabbitMQ();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`);
});
