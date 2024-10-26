import { Injectable } from '@nestjs/common';
import { QueueProvider } from '../interfaces/queue-provider.interface';
import { SQS } from 'aws-sdk';
import { DEFAULT_POLLING_INTERVAL_IN_MS, MAX_NUMBER_OF_MESSAGES, WAIT_TIME_IN_SECONDS } from '../../common/constants';

@Injectable()
export class SQSProvider implements QueueProvider {
  private sqs = new SQS({ region: 'us-east-1' });

  async publish(message: string): Promise<void> {
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: message,
    };
    console.log(`SQSProvider: Publishing message to SQS queue - ${message}`);
    await this.sqs.sendMessage(params).promise();
  }

  async subscribe(): Promise<void> {
    console.log('Subscribed to SQS queue and polling for messages.');
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES,
      WaitTimeSeconds: WAIT_TIME_IN_SECONDS, 
    };
  
    setInterval(async () => {
      console.log('SQSProvider: Polling SQS queue for messages.');
      const result = await this.sqs.receiveMessage(params).promise();
      if (result.Messages && result.Messages.length > 0) {
        result.Messages.forEach((msg) => {
          console.log(`SQSProvider: Received message from SQS - ${msg.Body}`);
          this.sqs.deleteMessage({
            QueueUrl: process.env.SQS_QUEUE_URL,
            ReceiptHandle: msg.ReceiptHandle,
          }).promise();
        });
      } else {
        console.log('SQSProvider: No messages available in SQS queue.');
      }
    }, DEFAULT_POLLING_INTERVAL_IN_MS); 
  }
  

  async receiveMessages(params): Promise<any> {
    return await this.sqs.receiveMessage(params).promise();
  }
}
