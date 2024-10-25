import { Injectable } from '@nestjs/common';
import { QueueProvider } from '../interfaces/queue-provider.interface';
import { SQS } from 'aws-sdk';

@Injectable()
export class SQSProvider implements QueueProvider {
  private sqs = new SQS({ region: 'us-east-1' });

  async publish(message: string): Promise<void> {
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: message,
    };
    await this.sqs.sendMessage(params).promise();
  }

  async subscribe(): Promise<void> {
    console.log('Subscribed to SQS queue');
  }
}
