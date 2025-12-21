import nodemailer from "nodemailer";

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `EcoMart <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.log("Email error:", err.message);
  }
};
