import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private channel: amqplib.Channel;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@localhost:5672';
      const connection = await amqplib.connect(rabbitmqUrl);
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
