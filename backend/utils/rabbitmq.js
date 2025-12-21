import amqplib from "amqplib";

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(
      "amqp://admin:admin@localhost:5672"
    );

    channel = await connection.createChannel();
    await channel.assertQueue("emailQueue");

    console.log("🐰 RabbitMQ connected");
  } catch (err) {
    console.error("RabbitMQ connection error:", err.message);
  }
};

export const getChannel = () => channel;
