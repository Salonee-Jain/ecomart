import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  paymentIntentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'aud' })
  currency: string;

  @Prop({ enum: ['pending', 'succeeded', 'failed', 'canceled'], default: 'pending' })
  status: string;

  @Prop()
  paymentMethod: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
