import { Injectable } from '@nestjs/common';
import { QueueProvider } from './interfaces/queue-provider.interface';

@Injectable()
export class QueueService {
  constructor(private readonly queueProvider: QueueProvider) {}

  publishMessage(message: string): Promise<void> {
    return this.queueProvider.publish(message);
  }

  subscribeToMessages(): Promise<void> {
    return this.queueProvider.subscribe();
  }
}
