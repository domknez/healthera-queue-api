import { Injectable } from '@nestjs/common';
import { QueueProvider } from '../interfaces/queue-provider.interface';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProvider implements QueueProvider {
  private connection;
  private channel;

  async connect() {
    if (!this.connection) {
      console.log('RabbitMQProvider: Establishing connection to RabbitMQ.');
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      console.log('RabbitMQProvider: Connection established.');
    }
  }

  async publish(message: string): Promise<void> {
    await this.connect();
    const queue = 'message_queue';
    await this.channel.assertQueue(queue);
    console.log(`RabbitMQProvider: Publishing message to RabbitMQ queue - ${message}`);
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async subscribe(): Promise<void> {
    await this.connect();
    const queue = 'message_queue';
    await this.channel.assertQueue(queue);
  
    console.log('Subscribed to RabbitMQ queue and waiting for messages.');
    this.channel.consume(queue, (msg) => {
      if (msg) {
        const messageContent = msg.content.toString();
        console.log(`RabbitMQProvider: Received message from RabbitMQ - ${messageContent}`);
        this.channel.ack(msg);
      }
    });
  }

  async receiveMessages(): Promise<string[]> {
    await this.connect();
    const queue = 'message_queue';
    await this.channel.assertQueue(queue);
  
    const messages: string[] = [];
    const msg = await this.channel.get(queue, { noAck: false });
    if (msg) {
      const messageContent = msg.content.toString();
      console.log(`Received message: ${messageContent}`);
      messages.push(messageContent);
      this.channel.ack(msg);
    } else {
      console.log('No messages available');
    }
    return messages;
  }
  
}
