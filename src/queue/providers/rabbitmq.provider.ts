import { Injectable } from '@nestjs/common';
import { QueueProvider } from '../interfaces/queue-provider.interface';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProvider implements QueueProvider {
  private connection;
  private channel;

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
  }

  async publish(message: string): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const queue = 'message_queue';
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async subscribe(): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const queue = 'message_queue';
    await this.channel.assertQueue(queue);
    this.channel.consume(queue, (msg) => {
      console.log('Received:', msg.content.toString());
      this.channel.ack(msg);
    });
  }
}
