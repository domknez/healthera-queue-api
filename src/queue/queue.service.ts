import { Inject, Injectable } from '@nestjs/common';
import { QueueProvider } from './interfaces/queue-provider.interface';

const QUEUE_PROVIDER_TOKEN = 'QUEUE_PROVIDER_TOKEN';

@Injectable()
export class QueueService {
  constructor(
    @Inject(QUEUE_PROVIDER_TOKEN) private readonly queueProvider: QueueProvider,
  ) {}

  publishMessage(message: string): Promise<void> {
    return this.queueProvider.publish(message);
  }

  subscribeToMessages(): Promise<void> {
    return this.queueProvider.subscribe();
  }

  async receiveMessages(): Promise<any> {
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 1, 
    };
    return await this.queueProvider.receiveMessages(params);
  }
}
