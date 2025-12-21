import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `EcoMart <${this.configService.get<string>('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });

      console.log('Email sent to:', to);
    } catch (err) {
      console.log('Email error:', err.message);
    }
  }

  paymentSuccessTemplate(order: any): string {
    return `
    <h2>🎉 Payment Successful</h2>
    <p>Hi, thank you for your purchase!</p>

    <p>Your order <strong>${order._id}</strong> has been successfully paid.</p>

    <h3>Order Summary:</h3>
    <ul>
      ${order.orderItems
        .map(
          (item: any) =>
            `<li>${item.name} — ${item.quantity} × $${item.price}</li>`,
        )
        .join('')}
    </ul>

    <p><strong>Total:</strong> $${order.totalPrice}</p>

    <p>We will notify you once it is shipped.</p>

    <br/>
    <p>— EcoMart Team</p>
  `;
  }
}
