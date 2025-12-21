import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private channel: amqplib.Channel;

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    try {
      const connection = await amqplib.connect('amqp://admin:admin@localhost:5672');
      this.channel = await connection.createChannel();
      await this.channel.assertQueue('emailQueue');

      console.log('🐰 RabbitMQ connected');
    } catch (err) {
      console.error('RabbitMQ connection error:', err.message);
    }
  }

  getChannel(): amqplib.Channel {
    return this.channel;
  }
}
