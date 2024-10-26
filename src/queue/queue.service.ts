import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { QueueProvider } from './interfaces/queue-provider.interface';

const QUEUE_PROVIDER_TOKEN = 'QUEUE_PROVIDER_TOKEN';

@Injectable()
export class QueueService implements OnModuleInit {
  constructor(
    @Inject(QUEUE_PROVIDER_TOKEN) private readonly queueProvider: QueueProvider,
  ) {}

  async onModuleInit() {
    console.log('QueueService: Initializing subscription for the selected provider...');
    await this.queueProvider.subscribe();
  }

  async publishMessage(message: string): Promise<void> {
    console.log(`QueueService: Publishing message - ${message}`);
    await this.queueProvider.publish(message);
  }
}
